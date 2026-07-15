import "dotenv/config";

import { PrismaClient, type BusinessDocumentType } from "@prisma/client";

const prisma = new PrismaClient();

const SUPPLIER_DOCUMENT_TYPES: BusinessDocumentType[] = ["PURCHASE_DOCUMENT", "DELIVERY_NOTE"];
const CUSTOMER_ACCOUNT_DOCUMENT_TYPES: BusinessDocumentType[] = ["E_INVOICE", "E_DISPATCH"];

type MatchResult = {
  id: string | null;
  reason: "exact" | "order" | "missing" | "ambiguous";
};

function normalizeLookup(value: string | null | undefined) {
  return (value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("tr-TR");
}

function buildIndex<T extends { id: string; name: string }>(items: T[]) {
  const index = new Map<string, T[]>();

  for (const item of items) {
    const key = normalizeLookup(item.name);
    if (!key) {
      continue;
    }

    const current = index.get(key) ?? [];
    current.push(item);
    index.set(key, current);
  }

  return index;
}

function resolveIndexMatch<T extends { id: string }>(
  index: Map<string, T[]>,
  rawName: string | null | undefined,
): MatchResult {
  const key = normalizeLookup(rawName);
  if (!key) {
    return { id: null, reason: "missing" };
  }

  const matches = index.get(key) ?? [];
  if (matches.length === 1) {
    return { id: matches[0].id, reason: "exact" };
  }

  if (matches.length > 1) {
    return { id: null, reason: "ambiguous" };
  }

  return { id: null, reason: "missing" };
}

async function main() {
  const shouldWrite = process.argv.includes("--write");

  const [suppliers, customerAccounts, documents] = await Promise.all([
    prisma.supplier.findMany({
      where: { deleted: false },
      select: { id: true, name: true },
    }),
    prisma.customerAccount.findMany({
      where: { deleted: false },
      select: { id: true, name: true },
    }),
    prisma.businessDocument.findMany({
      where: {
        deleted: false,
        OR: [
          { supplierId: null },
          { customerAccountId: null },
        ],
      },
      orderBy: [
        { issueDate: "desc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        documentNumber: true,
        documentType: true,
        counterpartyName: true,
        supplierId: true,
        customerAccountId: true,
        order: {
          select: {
            customerAccountId: true,
          },
        },
      },
    }),
  ]);

  const supplierIndex = buildIndex(suppliers);
  const customerAccountIndex = buildIndex(customerAccounts);

  const stats = {
    scanned: documents.length,
    supplierLinked: 0,
    customerLinked: 0,
    updatedDocuments: 0,
    unresolvedSupplier: 0,
    unresolvedCustomer: 0,
    ambiguousSupplier: 0,
    ambiguousCustomer: 0,
  };

  const unresolved: Array<{
    documentNumber: string;
    documentType: BusinessDocumentType;
    counterpartyName: string;
    missing: "supplier" | "customerAccount";
    reason: MatchResult["reason"];
  }> = [];

  for (const document of documents) {
    const usesSupplier = SUPPLIER_DOCUMENT_TYPES.includes(document.documentType);
    const usesCustomerAccount = CUSTOMER_ACCOUNT_DOCUMENT_TYPES.includes(document.documentType);

    let nextSupplierId = document.supplierId;
    let nextCustomerAccountId = document.customerAccountId;

    if (usesSupplier && !document.supplierId) {
      const supplierMatch = resolveIndexMatch(supplierIndex, document.counterpartyName);
      if (supplierMatch.id) {
        nextSupplierId = supplierMatch.id;
        stats.supplierLinked += 1;
      } else {
        if (supplierMatch.reason === "ambiguous") {
          stats.ambiguousSupplier += 1;
        } else {
          stats.unresolvedSupplier += 1;
        }

        unresolved.push({
          documentNumber: document.documentNumber,
          documentType: document.documentType,
          counterpartyName: document.counterpartyName,
          missing: "supplier",
          reason: supplierMatch.reason,
        });
      }
    }

    if (usesCustomerAccount && !document.customerAccountId) {
      const orderCustomerAccountId = document.order?.customerAccountId ?? null;
      if (orderCustomerAccountId) {
        nextCustomerAccountId = orderCustomerAccountId;
        stats.customerLinked += 1;
      } else {
        const customerMatch = resolveIndexMatch(customerAccountIndex, document.counterpartyName);
        if (customerMatch.id) {
          nextCustomerAccountId = customerMatch.id;
          stats.customerLinked += 1;
        } else {
          if (customerMatch.reason === "ambiguous") {
            stats.ambiguousCustomer += 1;
          } else {
            stats.unresolvedCustomer += 1;
          }

          unresolved.push({
            documentNumber: document.documentNumber,
            documentType: document.documentType,
            counterpartyName: document.counterpartyName,
            missing: "customerAccount",
            reason: customerMatch.reason,
          });
        }
      }
    }

    if (!shouldWrite) {
      if (nextSupplierId !== document.supplierId || nextCustomerAccountId !== document.customerAccountId) {
        stats.updatedDocuments += 1;
      }
      continue;
    }

    if (nextSupplierId === document.supplierId && nextCustomerAccountId === document.customerAccountId) {
      continue;
    }

    await prisma.businessDocument.update({
      where: { id: document.id },
      data: {
        supplierId: nextSupplierId,
        customerAccountId: nextCustomerAccountId,
      },
    });

    stats.updatedDocuments += 1;
  }

  console.log(JSON.stringify({
    mode: shouldWrite ? "write" : "dry-run",
    stats,
    unresolvedSample: unresolved.slice(0, 25),
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
