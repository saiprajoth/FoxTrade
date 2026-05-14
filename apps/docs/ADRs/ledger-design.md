# ADR-004: Wallet Ledger for Auditable Balance Movements

## Status

Accepted

## Context

FoxTrade is a paper trading exchange simulator that models users, assets, trading pairs, account balances, orders, trades, and future trade settlement.

In Step 2, FoxTrade introduced `account_balances` with:

- `availableQuantity`
- `reservedQuantity`

This is correct for trading systems because open orders must lock funds or assets before execution. However, balance fields alone are not enough. If the system only mutates balances directly, we lose the history of **why** the balance changed.

For a trading platform, every financial movement must be explainable:

- Why did the user's available USD decrease?
- Why did reserved BTC increase?
- Which order caused the reservation?
- Which trade caused the settlement?
- Was the change caused by seed data, order placement, cancellation, settlement, or system adjustment?
- Did a retry accidentally create duplicate balance movement?

A ledger is required now because the next steps will introduce order reservation, order cancellation, matching, and settlement. All of those features mutate financial state. If we build those flows before a ledger exists, we risk building an opaque and hard-to-debug balance system.

### Drivers

* **Financial correctness:** Every cash and asset movement must be traceable.
* **Auditability:** We need a durable record of balance movements for debugging and interview-grade system explanation.
* **Trading-domain correctness:** Reservation, release, partial fill, full fill, and settlement flows require clear accounting.
* **Data integrity:** Balance mutations should not happen without a corresponding ledger entry.
* **Idempotency readiness:** Future order APIs must prevent duplicate financial movements during retries.
* **Production-style design:** PostgreSQL must remain the durable source of truth for financial records.
* **Debuggability:** Developers should be able to inspect a user's ledger and reconstruct why balances changed.

## Decision

We will introduce a durable, append-only `LedgerEntry` model in PostgreSQL.

Each ledger entry will represent one financial movement for one user and one asset.

FoxTrade will use a **delta-based ledger** with separate fields for:

- `availableDelta`
- `reservedDelta`

This allows the ledger to clearly describe movements between available and reserved balances.

Examples:

| Business event | availableDelta | reservedDelta |
|---|---:|---:|
| Initial USD deposit | `+10000` | `0` |
| Reserve USD for buy order | `-2000` | `+2000` |
| Release USD after cancelled buy order | `+2000` | `-2000` |
| Trade debits reserved USD | `0` or settlement-specific debit | `-2000` |
| Trade credits BTC | `+1` | `0` |

The ledger will store:

- `userId`
- `assetId`
- `type`
- `availableDelta`
- `reservedDelta`
- `availableBalanceAfter`
- `reservedBalanceAfter`
- `referenceType`
- `referenceId`
- `idempotencyKey`
- `description`
- `metadata`
- `createdAt`

Ledger entries will be created by business actions, not by arbitrary public API calls.

Examples of business actions:

- seed initial deposit
- cash deposit
- asset deposit
- reserve funds for buy order
- reserve holdings for sell order
- release reserved cash after cancellation
- release reserved asset after cancellation
- trade settlement debit
- trade settlement credit
- system adjustment

We will not expose a public `POST /ledger` endpoint. Ledger writes must happen inside controlled business services such as order reservation, cancellation, and settlement.

PostgreSQL remains the durable source of truth. Redis must not be used as the ledger because Redis is only for cache, event distribution, rate limits, and realtime fanout.

## Alternatives Considered

* **Option A: Update balances only**

  Rejected.

  This is the simplest implementation, but it creates an opaque financial system. If `availableQuantity` changes from `10000` to `8000`, we cannot reliably explain whether it happened because of an order, cancellation, trade, manual adjustment, or bug.

  This approach is not acceptable for a trading-related backend project because it does not provide auditability or historical traceability.

* **Option B: Single amount-only ledger**

  Rejected.

  A single `amount` field can record deposits and withdrawals, but it does not clearly model movement between `availableQuantity` and `reservedQuantity`.

  Trading systems need to represent reservation flows. For example, placing a buy order should decrease available USD and increase reserved USD. That is not a simple deposit or withdrawal; it is a transfer between balance buckets.

* **Option C: Store ledger events only in Redis**

  Rejected.

  Redis is useful for fast reads, pub/sub, streams, rate limits, and realtime event fanout. It should not be the durable source of truth for financial movement history.

  If Redis is flushed or events expire, the audit trail would be lost. Financial records must be stored in PostgreSQL.

* **Option D: Event-sourcing everything from the start**

  Rejected for now.

  Full event sourcing would store all state changes as events and rebuild balances from the event log. This is powerful, but it increases complexity too early.

  FoxTrade will use a practical ledger-first design now. Later, we can evolve toward event replay or event sourcing for open orders, matching engine recovery, or audit reconstruction.

## Consequences (Trade-offs)

* **Pros (+):**

    * Provides a durable audit trail for every cash and asset movement.
    * Makes account balance changes explainable and debuggable.
    * Supports order reservation, cancellation, partial fill, full fill, and settlement flows.
    * Helps enforce the rule: no balance mutation without a ledger entry.
    * Improves interview signal by showing finance-grade backend thinking.
    * Prepares the system for idempotency and retry-safe order APIs.
    * Allows future admin/debug views to show why balances changed.
    * Enables future invariant tests such as:
        * available balance never becomes negative
        * reserved balance never becomes negative
        * cancellations release reserved balances correctly
        * settlement creates matching debit/credit ledger entries

* **Cons (-):**

    * Every balance-changing operation becomes more complex.
    * Balance mutation and ledger writing must happen in the same database transaction.
    * Bugs in ledger creation can block order placement or settlement.
    * Ledger tables can grow quickly and will later need pagination, indexes, and retention strategy.
    * Developers must understand the difference between available, reserved, and ledger deltas.
    * Future refactoring may be needed if FoxTrade evolves into full event sourcing.

## Implementation Notes

### Step 3 Scope

For Step 3, we will implement:

- `LedgerEntryType` enum
- `LedgerReferenceType` enum
- `LedgerEntry` model
- seed ledger entries for initial balances
- internal `createLedgerEntry` service
- read-only ledger API:
  - `GET /api/users/:userId/ledger`

We will not implement order reservation, cancellation, or settlement yet. Those will use the ledger in later steps.

### Database Model Summary

```prisma
model LedgerEntry {
  id String @id @default(uuid()) @db.Uuid

  userId  String @map("user_id") @db.Uuid
  assetId String @map("asset_id") @db.Uuid

  type LedgerEntryType

  availableDelta Decimal @map("available_delta") @db.Decimal(36, 18)
  reservedDelta  Decimal @map("reserved_delta") @db.Decimal(36, 18)

  availableBalanceAfter Decimal? @map("available_balance_after") @db.Decimal(36, 18)
  reservedBalanceAfter  Decimal? @map("reserved_balance_after") @db.Decimal(36, 18)

  referenceType LedgerReferenceType @map("reference_type")
  referenceId   String?             @map("reference_id") @db.VarChar(160)

  idempotencyKey String? @unique @map("idempotency_key") @db.VarChar(180)

  description String? @db.Text
  metadata    Json?

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  asset Asset @relation(fields: [assetId], references: [id], onDelete: Restrict)

  createdAt DateTime @default(now()) @map("created_at")

  @@index([userId, createdAt])
  @@index([assetId, createdAt])
  @@index([type])
  @@index([referenceType, referenceId])
  @@map("ledger_entries")
}