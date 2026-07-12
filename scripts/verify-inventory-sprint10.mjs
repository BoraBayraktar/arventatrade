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
assertIncludes(auditDoc, "Product.stock", "Legacy stock audit dokümanı eksik.");
assertIncludes(auditDoc, "Yasak Kullanımlar", "Legacy stock audit yasak kullanım bölümü eksik.");

const inventoryRepo = read("src/modules/inventory/repositories/inventory.repository.ts");
assertIncludes(inventoryRepo, "Aggregate truth always comes from active inventory levels", "Inventory repository legacy summary notu eksik.");

const commerceRepo = read("src/modules/commerce/repositories/commerce.repository.ts");
assertIncludes(commerceRepo, "recalculateProductStockSummary", "Commerce repository summary senkronizasyon helper'ı eksik.");

const authorityDoc = read("docs/INVENTORY_STOCK_AUTHORITY.md");
assertIncludes(authorityDoc, "`Product.stock = legacy summary`", "Resmi stok otoritesi notu eksik.");

console.log("Sprint 10 inventory doğrulamaları başarıyla geçti.");
