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

const schema = read("prisma/schema.prisma");
assertIncludes(schema, "averageUnitCost", "averageUnitCost alanı bulunamadı.");
assertIncludes(schema, "lastPurchaseUnitCost", "lastPurchaseUnitCost alanı bulunamadı.");
assertIncludes(schema, "enum InventoryCostingMethod", "InventoryCostingMethod enum'u bulunamadı.");

const repository = read("src/modules/inventory/repositories/inventory.repository.ts");
assertIncludes(repository, "averageUnitCost: new Prisma.Decimal", "Ağırlıklı ortalama maliyet güncellemesi bulunamadı.");
assertIncludes(repository, "lastPurchaseUnitCost: new Prisma.Decimal", "Son alış maliyeti güncellemesi bulunamadı.");

const service = read("src/modules/inventory/services/inventory.service.ts");
assertIncludes(service, "function resolveInventoryUnitCost", "Maliyet çözümleyici helper bulunamadı.");
assertIncludes(service, "costingMethod: \"AVERAGE_COST\"", "Rapor overview maliyet yöntemi sabitlenmemiş.");
assertIncludes(service, "costingMethodLabel: \"Ağırlıklı ortalama maliyet\"", "Rapor maliyet yöntemi etiketi eksik.");

console.log("Sprint 6 inventory doğrulamaları başarıyla geçti.");
