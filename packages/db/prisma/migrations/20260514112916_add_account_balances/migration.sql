-- CreateTable
CREATE TABLE "account_balances" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "available_quantity" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "reserved_quantity" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_balances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "account_balances_user_id_idx" ON "account_balances"("user_id");

-- CreateIndex
CREATE INDEX "account_balances_asset_id_idx" ON "account_balances"("asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_balances_user_id_asset_id_key" ON "account_balances"("user_id", "asset_id");

-- AddForeignKey
ALTER TABLE "account_balances" ADD CONSTRAINT "account_balances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_balances" ADD CONSTRAINT "account_balances_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

