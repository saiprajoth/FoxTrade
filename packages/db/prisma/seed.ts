import { prisma } from "../src";
import { Prisma } from "../src";

async function upsertBalance(params: {
  userId: string;
  assetId: string;
  availableQuantity: string;
  reservedQuantity?: string;
}) {
  return prisma.accountBalance.upsert({
    where: {
      userId_assetId: {
        userId: params.userId,
        assetId: params.assetId
      }
    },
    update: {
      availableQuantity: new Prisma.Decimal(params.availableQuantity),
      reservedQuantity: new Prisma.Decimal(params.reservedQuantity ?? "0")
    },
    create: {
      userId: params.userId,
      assetId: params.assetId,
      availableQuantity: new Prisma.Decimal(params.availableQuantity),
      reservedQuantity: new Prisma.Decimal(params.reservedQuantity ?? "0")
    }
  });
}

async function seedInitialBalance(params: {
  userId: string;
  userEmail: string;
  assetId: string;
  assetSymbol: string;
  availableQuantity: string;
}) {
  await upsertBalance({
    userId: params.userId,
    assetId: params.assetId,
    availableQuantity: params.availableQuantity,
  });

  await upsertSeedLedgerEntry({
    userId: params.userId,
    assetId: params.assetId,
    assetSymbol: params.assetSymbol,
    availableQuantity: params.availableQuantity,
    idempotencyKey: `seed:${params.userEmail}:${params.assetSymbol}:initial`,
  });
}

async function upsertSeedLedgerEntry(params: {
  userId: string;
  assetId: string;
  assetSymbol: string;
  availableQuantity: string;
  idempotencyKey: string;
}) {
  return prisma.ledgerEntry.upsert({
    where: {
      idempotencyKey: params.idempotencyKey,
    },
    update: {
      availableDelta: new Prisma.Decimal(params.availableQuantity),
      reservedDelta: new Prisma.Decimal("0"),
      availableBalanceAfter: new Prisma.Decimal(params.availableQuantity),
      reservedBalanceAfter: new Prisma.Decimal("0"),
      description: `Initial seeded ${params.assetSymbol} balance`,
    },
    create: {
      userId: params.userId,
      assetId: params.assetId,
      type: "INITIAL_DEPOSIT",
      availableDelta: new Prisma.Decimal(params.availableQuantity),
      reservedDelta: new Prisma.Decimal("0"),
      availableBalanceAfter: new Prisma.Decimal(params.availableQuantity),
      reservedBalanceAfter: new Prisma.Decimal("0"),
      referenceType: "SEED",
      referenceId: params.idempotencyKey,
      idempotencyKey: params.idempotencyKey,
      description: `Initial seeded ${params.assetSymbol} balance`,
      metadata: {
        source: "seed",
        assetSymbol: params.assetSymbol,
      },
    },
  });
}

async function main() {
  const usd = await prisma.asset.upsert({
    where: { symbol: "USD" },
    update: {},
    create: {
      symbol: "USD",
      name: "US Dollar",
      type: "FIAT"
    }
  });

  const btc = await prisma.asset.upsert({
    where: { symbol: "BTC" },
    update: {},
    create: {
      symbol: "BTC",
      name: "Bitcoin",
      type: "CRYPTO"
    }
  });

  const eth = await prisma.asset.upsert({
    where: { symbol: "ETH" },
    update: {},
    create: {
      symbol: "ETH",
      name: "Ethereum",
      type: "CRYPTO"
    }
  });

  const aapl = await prisma.asset.upsert({
    where: { symbol: "AAPL" },
    update: {},
    create: {
      symbol: "AAPL",
      name: "Apple Inc.",
      type: "STOCK"
    }
  });

  const tsla = await prisma.asset.upsert({
    where: { symbol: "TSLA" },
    update: {},
    create: {
      symbol: "TSLA",
      name: "Tesla Inc.",
      type: "STOCK"
    }
  });

  await prisma.tradingPair.upsert({
    where: { symbol: "BTC-USD" },
    update: {},
    create: {
      symbol: "BTC-USD",
      baseAssetId: btc.id,
      quoteAssetId: usd.id
    }
  });

  await prisma.tradingPair.upsert({
    where: { symbol: "ETH-USD" },
    update: {},
    create: {
      symbol: "ETH-USD",
      baseAssetId: eth.id,
      quoteAssetId: usd.id
    }
  });

  await prisma.tradingPair.upsert({
    where: { symbol: "AAPL-USD" },
    update: {},
    create: {
      symbol: "AAPL-USD",
      baseAssetId: aapl.id,
      quoteAssetId: usd.id
    }
  });

  await prisma.tradingPair.upsert({
    where: { symbol: "TSLA-USD" },
    update: {},
    create: {
      symbol: "TSLA-USD",
      baseAssetId: tsla.id,
      quoteAssetId: usd.id
    }
  });

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {
      name: "Alice Demo"
    },
    create: {
      email: "alice@example.com",
      name: "Alice Demo"
    }
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {
      name: "Bob Demo"
    },
    create: {
      email: "bob@example.com",
      name: "Bob Demo"
    }
  });

  const marketMaker = await prisma.user.upsert({
    where: { email: "marketmaker@example.com" },
    update: {
      name: "Market Maker"
    },
    create: {
      email: "marketmaker@example.com",
      name: "Market Maker"
    }
  });

  // await upsertBalance({
  //   userId: alice.id,
  //   assetId: usd.id,
  //   availableQuantity: "10000"
  // });

  // await upsertBalance({
  //   userId: alice.id,
  //   assetId: btc.id,
  //   availableQuantity: "2"
  // });

  // await upsertBalance({
  //   userId: bob.id,
  //   assetId: usd.id,
  //   availableQuantity: "5000"
  // });

  // await upsertBalance({
  //   userId: bob.id,
  //   assetId: eth.id,
  //   availableQuantity: "10"
  // });

  // await upsertBalance({
  //   userId: marketMaker.id,
  //   assetId: usd.id,
  //   availableQuantity: "1000000"
  // });

  // await upsertBalance({
  //   userId: marketMaker.id,
  //   assetId: btc.id,
  //   availableQuantity: "100"
  // });

  // await upsertBalance({
  //   userId: marketMaker.id,
  //   assetId: eth.id,
  //   availableQuantity: "500"
  // });


  await seedInitialBalance({
  userId: alice.id,
  userEmail: alice.email,
  assetId: usd.id,
  assetSymbol: usd.symbol,
  availableQuantity: "10000",
});

await seedInitialBalance({
  userId: alice.id,
  userEmail: alice.email,
  assetId: btc.id,
  assetSymbol: btc.symbol,
  availableQuantity: "2",
});

await seedInitialBalance({
  userId: bob.id,
  userEmail: bob.email,
  assetId: usd.id,
  assetSymbol: usd.symbol,
  availableQuantity: "5000",
});

await seedInitialBalance({
  userId: bob.id,
  userEmail: bob.email,
  assetId: eth.id,
  assetSymbol: eth.symbol,
  availableQuantity: "10",
});

await seedInitialBalance({
  userId: marketMaker.id,
  userEmail: marketMaker.email,
  assetId: usd.id,
  assetSymbol: usd.symbol,
  availableQuantity: "1000000",
});

await seedInitialBalance({
  userId: marketMaker.id,
  userEmail: marketMaker.email,
  assetId: btc.id,
  assetSymbol: btc.symbol,
  availableQuantity: "100",
});

await seedInitialBalance({
  userId: marketMaker.id,
  userEmail: marketMaker.email,
  assetId: eth.id,
  assetSymbol: eth.symbol,
  availableQuantity: "500",
});

  console.log("Database seeded successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });