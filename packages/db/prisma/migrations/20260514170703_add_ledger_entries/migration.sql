-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('INITIAL_DEPOSIT', 'CASH_DEPOSIT', 'ASSET_DEPOSIT', 'RESERVE_FOR_BUY_ORDER', 'RESERVE_FOR_SELL_ORDER', 'RELEASE_RESERVED_CASH', 'RELEASE_RESERVED_ASSET', 'TRADE_DEBIT_CASH', 'TRADE_CREDIT_CASH', 'TRADE_DEBIT_ASSET', 'TRADE_CREDIT_ASSET', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "LedgerReferenceType" AS ENUM ('SEED', 'ORDER', 'TRADE', 'SYSTEM');

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "type" "LedgerEntryType" NOT NULL,
    "available_delta" DECIMAL(36,18) NOT NULL,
    "reserved_delta" DECIMAL(36,18) NOT NULL,
    "available_balance_after" DECIMAL(36,18),
    "reserved_balance_after" DECIMAL(36,18),
    "reference_type" "LedgerReferenceType" NOT NULL,
    "reference_id" VARCHAR(160),
    "idempotency_key" VARCHAR(180),
    "description" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ledger_entries_idempotency_key_key" ON "ledger_entries"("idempotency_key");

-- CreateIndex
CREATE INDEX "ledger_entries_user_id_created_at_idx" ON "ledger_entries"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "ledger_entries_asset_id_created_at_idx" ON "ledger_entries"("asset_id", "created_at");

-- CreateIndex
CREATE INDEX "ledger_entries_type_idx" ON "ledger_entries"("type");

-- CreateIndex
CREATE INDEX "ledger_entries_reference_type_reference_id_idx" ON "ledger_entries"("reference_type", "reference_id");

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
