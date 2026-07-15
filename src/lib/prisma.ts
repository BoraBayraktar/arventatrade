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
    inventoryHistoryEvent?: unknown;
    inventoryExportHistory?: unknown;
    userInventoryPreference?: unknown;
    stockCount?: unknown;
    stockCountLine?: unknown;
    inventoryTransaction?: unknown;
    integrationSyncJob?: unknown;
    collectionRecord?: unknown;
    paymentRecord?: unknown;
    customerAccount?: unknown;
  };

  return (
    typeof delegateCheck.productReview !== "undefined"
    && typeof delegateCheck.productQuestion !== "undefined"
    && typeof delegateCheck.inventoryAlert !== "undefined"
    && typeof delegateCheck.inventoryHistoryEvent !== "undefined"
    && typeof delegateCheck.inventoryExportHistory !== "undefined"
    && typeof delegateCheck.userInventoryPreference !== "undefined"
    && typeof delegateCheck.stockCount !== "undefined"
    && typeof delegateCheck.stockCountLine !== "undefined"
    && typeof delegateCheck.inventoryTransaction !== "undefined"
    && typeof delegateCheck.integrationSyncJob !== "undefined"
    && typeof delegateCheck.collectionRecord !== "undefined"
    && typeof delegateCheck.paymentRecord !== "undefined"
    && typeof delegateCheck.customerAccount !== "undefined"
  );
}

function resolvePrismaClient() {
  if (hasRequiredDelegates(global.prismaClient)) {
    return global.prismaClient;
  }

  const nextClient = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    global.prismaClient = nextClient;
  }

  return nextClient;
}

const prismaClient = resolvePrismaClient();

export const prisma = new Proxy(prismaClient, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    if (typeof value !== "undefined") {
      return value;
    }

    if (typeof prop !== "string" || prop.startsWith("$")) {
      return value;
    }

    const refreshedClient = createPrismaClient();
    if (process.env.NODE_ENV !== "production") {
      global.prismaClient = refreshedClient;
    }

    return Reflect.get(refreshedClient, prop, refreshedClient);
  },
});

if (process.env.NODE_ENV !== "production") {
  global.prismaClient = prismaClient;
}
