import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function assertIncludes(content, expected, message) {
  if (!content.includes(expected)) {
    throw new Error(message);
  }
}

const auditDoc = read("docs/INVENTORY_LEGACY_STOCK_AUDIT.md");
assertIncludes(auditDoc, "Storefront Kararı", "Storefront stock kararı dokümante edilmemiş.");
assertIncludes(auditDoc, "Sepete ekleme", "Storefront aggregate kullanım kuralı eksik.");

const verifyCheckout = read("scripts/verify-checkout.mjs");
assertIncludes(verifyCheckout, "readAggregateStock", "Checkout verify aggregate helper eksik.");
assertIncludes(verifyCheckout, "aggregateStock === initialStock - 1", "Checkout verify aggregate stock doğrulaması eksik.");

const verifyOrders = read("scripts/verify-orders.mjs");
assertIncludes(verifyOrders, "readAggregateStock", "Orders verify aggregate helper eksik.");
assertIncludes(verifyOrders, "aggregate stock to", "Orders verify aggregate stock doğrulaması eksik.");

const catalogService = read("src/modules/catalog/services/catalog.service.ts");
assertIncludes(catalogService, "const aggregateStock = inventoryLevels.length > 0", "Catalog service aggregate stock üretmiyor.");

console.log("Hafta 1 kapanış doğrulamaları başarıyla geçti.");
