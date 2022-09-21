-- CreateTable
CREATE TABLE "WalletNonces" (
    "address" VARCHAR(255) NOT NULL,
    "nonce" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WalletNonces_pkey" PRIMARY KEY ("address")
);
