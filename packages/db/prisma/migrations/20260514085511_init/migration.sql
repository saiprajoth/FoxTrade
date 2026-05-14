-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('FIAT', 'CRYPTO', 'STOCK');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "password_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" UUID NOT NULL,
    "symbol" VARCHAR(20) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "type" "AssetType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trading_pairs" (
    "id" UUID NOT NULL,
    "symbol" VARCHAR(40) NOT NULL,
    "base_asset_id" UUID NOT NULL,
    "quote_asset_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trading_pairs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "assets_symbol_key" ON "assets"("symbol");

-- CreateIndex
CREATE INDEX "assets_type_idx" ON "assets"("type");

-- CreateIndex
CREATE INDEX "assets_is_active_idx" ON "assets"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "trading_pairs_symbol_key" ON "trading_pairs"("symbol");

-- CreateIndex
CREATE INDEX "trading_pairs_base_asset_id_idx" ON "trading_pairs"("base_asset_id");

-- CreateIndex
CREATE INDEX "trading_pairs_quote_asset_id_idx" ON "trading_pairs"("quote_asset_id");

-- CreateIndex
CREATE INDEX "trading_pairs_is_active_idx" ON "trading_pairs"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "trading_pairs_base_asset_id_quote_asset_id_key" ON "trading_pairs"("base_asset_id", "quote_asset_id");

-- AddForeignKey
ALTER TABLE "trading_pairs" ADD CONSTRAINT "trading_pairs_base_asset_id_fkey" FOREIGN KEY ("base_asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trading_pairs" ADD CONSTRAINT "trading_pairs_quote_asset_id_fkey" FOREIGN KEY ("quote_asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
