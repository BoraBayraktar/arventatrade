import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

for (const path of [".env.local", ".env"]) {
  require("dotenv").config({ path, override: false });
}

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const shouldFix = process.argv.includes("--fix");

function normalizeSku(sku) {
  return String(sku ?? "").trim().toLocaleUpperCase("tr-TR");
}

function buildRepairSku(row, usedSkus) {
  const base = normalizeSku(row.sku)
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "SKU";
  const suffix = row.kind === "PRODUCT" ? "PRD" : "VAR";
  const shortId = row.id.slice(-6).toLocaleUpperCase("tr-TR");
  let candidate = `${base}-${suffix}-${shortId}`;
  let index = 2;

  while (usedSkus.has(normalizeSku(candidate))) {
    candidate = `${base}-${suffix}-${shortId}-${index}`;
    index += 1;
  }

  usedSkus.add(normalizeSku(candidate));
  return candidate;
}

function chooseKeeper(rows) {
  return [...rows].sort((a, b) => {
    if (a.deleted !== b.deleted) {
      return a.deleted ? 1 : -1;
    }
    if (a.kind !== b.kind) {
      return a.kind === "PRODUCT" ? -1 : 1;
    }
    return a.id.localeCompare(b.id);
  })[0];
}

async function main() {
  const [products, variants] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        sku: true,
        name: true,
        deleted: true,
      },
    }),
    prisma.productVariant.findMany({
      select: {
        id: true,
        sku: true,
        title: true,
        productId: true,
        deleted: true,
        product: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const rows = [
    ...products.map((product) => ({
      kind: "PRODUCT",
      id: product.id,
      sku: product.sku,
      label: product.name,
      deleted: product.deleted,
    })),
    ...variants.map((variant) => ({
      kind: "VARIANT",
      id: variant.id,
      sku: variant.sku,
      label: `${variant.product.name} / ${variant.title}`,
      productId: variant.productId,
      deleted: variant.deleted,
    })),
  ];

  const usedSkus = new Set(rows.map((row) => normalizeSku(row.sku)).filter(Boolean));
  const groups = new Map();

  for (const row of rows) {
    const sku = normalizeSku(row.sku);
    if (!sku) {
      continue;
    }
    groups.set(sku, [...(groups.get(sku) ?? []), row]);
  }

  const duplicateGroups = [...groups.entries()].filter(([, groupRows]) => groupRows.length > 1);

  if (duplicateGroups.length === 0) {
    console.log("Mükerrer SKU bulunmadı.");
    return;
  }

  const repairs = [];

  for (const [sku, groupRows] of duplicateGroups) {
    const keeper = chooseKeeper(groupRows);
    console.log(`\nSKU ${sku} için ${groupRows.length} kayıt bulundu. Korunan kayıt: ${keeper.kind} ${keeper.id} (${keeper.label})`);

    for (const row of groupRows) {
      if (row.kind === keeper.kind && row.id === keeper.id) {
        continue;
      }

      const nextSku = buildRepairSku(row, usedSkus);
      repairs.push({ row, nextSku });
      console.log(`- ${row.kind} ${row.id} (${row.label}) -> ${nextSku}`);
    }
  }

  if (!shouldFix) {
    console.log("\nDry-run tamamlandı. Değişiklik yapmak için: node scripts/repair-duplicate-skus.mjs --fix");
    return;
  }

  for (const repair of repairs) {
    if (repair.row.kind === "PRODUCT") {
      await prisma.product.update({
        where: {
          id: repair.row.id,
        },
        data: {
          sku: repair.nextSku,
        },
      });
    } else {
      await prisma.productVariant.update({
        where: {
          id: repair.row.id,
        },
        data: {
          sku: repair.nextSku,
        },
      });
    }
  }

  console.log(`\n${repairs.length} mükerrer SKU düzeltildi.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
