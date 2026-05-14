import { prisma } from "@repo/db";

export async function getActiveAssets() {
  return prisma.asset.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      symbol: "asc"
    }
  });
}

export async function getActiveMarkets() {
  return prisma.tradingPair.findMany({
    where: {
      isActive: true
    },
    include: {
      baseAsset: true,
      quoteAsset: true
    },
    orderBy: {
      symbol: "asc"
    }
  });
}