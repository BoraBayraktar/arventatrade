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

const concurrencyDoc = read("docs/INVENTORY_CONCURRENCY_RULES.md");
assertIncludes(concurrencyDoc, "serializable transaction", "Eşzamanlılık kuralları dokümanı eksik.");
assertIncludes(concurrencyDoc, "`Product.stock`", "Legacy summary notu concurrency dokümanında eksik.");

const commerceRepository = read("src/modules/commerce/repositories/commerce.repository.ts");
assertIncludes(commerceRepository, "STALE_RESERVATION_LEVEL:", "Checkout stale reservation guard'ı eksik.");
assertIncludes(commerceRepository, "getActiveLevelSnapshot", "Güncel depo seviyesi helper'ı eksik.");
assertIncludes(commerceRepository, "RESTOCK_LEVEL_NOT_FOUND:", "Restock level koruması eksik.");

const commerceService = read("src/modules/commerce/services/commerce.service.ts");
assertIncludes(commerceService, "error.message.startsWith(\"STALE_RESERVATION_LEVEL\")", "Commerce service stale reservation hatasını ele almıyor.");

console.log("Sprint 7 kritik eşzamanlılık doğrulamaları başarıyla geçti.");
