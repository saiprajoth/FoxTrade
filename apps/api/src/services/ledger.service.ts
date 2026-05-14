import { prisma, Prisma } from "@repo/db";

export async function getUserLedgerEntries(params: {
  userId: string;
  limit: number;
}) {
  const entries = await prisma.ledgerEntry.findMany({
    where: {
      userId: params.userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: params.limit,
    include: {
      asset: {
        select: {
          id: true,
          symbol: true,
          name: true,
          type: true,
        },
      },
    },
  });

  return entries.map((entry) => ({
    id: entry.id,
    type: entry.type,
    asset: entry.asset,
    availableDelta: entry.availableDelta.toString(),
    reservedDelta: entry.reservedDelta.toString(),
    availableBalanceAfter: entry.availableBalanceAfter?.toString() ?? null,
    reservedBalanceAfter: entry.reservedBalanceAfter?.toString() ?? null,
    referenceType: entry.referenceType,
    referenceId: entry.referenceId,
    description: entry.description,
    metadata: entry.metadata,
    createdAt: entry.createdAt,
  }));
}

export async function createLedgerEntry(params: {
  userId: string;
  assetId: string;
  type:
    | "INITIAL_DEPOSIT"
    | "CASH_DEPOSIT"
    | "ASSET_DEPOSIT"
    | "RESERVE_FOR_BUY_ORDER"
    | "RESERVE_FOR_SELL_ORDER"
    | "RELEASE_RESERVED_CASH"
    | "RELEASE_RESERVED_ASSET"
    | "TRADE_DEBIT_CASH"
    | "TRADE_CREDIT_CASH"
    | "TRADE_DEBIT_ASSET"
    | "TRADE_CREDIT_ASSET"
    | "ADJUSTMENT";
  availableDelta: string;
  reservedDelta: string;
  availableBalanceAfter?: string;
  reservedBalanceAfter?: string;
  referenceType: "SEED" | "ORDER" | "TRADE" | "SYSTEM";
  referenceId?: string;
  idempotencyKey?: string;
  description?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.ledgerEntry.create({
    data: {
      userId: params.userId,
      assetId: params.assetId,
      type: params.type,
      availableDelta: new Prisma.Decimal(params.availableDelta),
      reservedDelta: new Prisma.Decimal(params.reservedDelta),
      availableBalanceAfter: params.availableBalanceAfter
        ? new Prisma.Decimal(params.availableBalanceAfter)
        : undefined,
      reservedBalanceAfter: params.reservedBalanceAfter
        ? new Prisma.Decimal(params.reservedBalanceAfter)
        : undefined,
      referenceType: params.referenceType,
      referenceId: params.referenceId,
      idempotencyKey: params.idempotencyKey,
      description: params.description,
      metadata: params.metadata,
    },
  });
}