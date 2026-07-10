import { PrismaClient } from "@prisma/client";

declare global {
  var prismaClient: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });
}

function hasRequiredDelegates(client: PrismaClient | undefined): client is PrismaClient {
  if (!client) {
    return false;
  }

  // In dev, schema/client can change while global cache still holds an older instance.
  const delegateCheck = client as PrismaClient & {
    productReview?: unknown;
    productQuestion?: unknown;
    inventoryAlert?: unknown;
    stockCount?: unknown;
    stockCountLine?: unknown;
    inventoryTransaction?: unknown;
    integrationSyncJob?: unknown;
  };

  return (
    typeof delegateCheck.productReview !== "undefined"
    && typeof delegateCheck.productQuestion !== "undefined"
    && typeof delegateCheck.inventoryAlert !== "undefined"
    && typeof delegateCheck.stockCount !== "undefined"
    && typeof delegateCheck.stockCountLine !== "undefined"
    && typeof delegateCheck.inventoryTransaction !== "undefined"
    && typeof delegateCheck.integrationSyncJob !== "undefined"
  );
}

export const prisma =
  hasRequiredDelegates(global.prismaClient) ? global.prismaClient : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prismaClient = prisma;
}
