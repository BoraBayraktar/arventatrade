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

const policyDoc = read("docs/INVENTORY_COSTING_POLICY.md");
assertIncludes(policyDoc, "Resmi maliyet otoritesi:", "Maliyet politikası resmi maliyet otoritesini netleştirmiyor.");
assertIncludes(policyDoc, "Karşılaştırma / analiz görünümü:", "Maliyet politikası karşılaştırma görünümünü ayırmıyor.");
assertIncludes(policyDoc, "resolveInventoryUnitCost", "Maliyet politikası resmi helper ayrımını tanımlamıyor.");

const contracts = read("src/modules/inventory/contracts/inventory.contract.ts");
assertIncludes(contracts, "officialCostingMethod: \"AVERAGE_COST\";", "Inventory report contract resmi maliyet alanını içermiyor.");
assertIncludes(contracts, "displayCostingMethod: AdminInventoryReportCostingMethod;", "Inventory report contract görünen maliyet alanını içermiyor.");
assertIncludes(contracts, "comparisonCostingModeEnabled: boolean;", "Inventory report contract karşılaştırma modu alanını içermiyor.");

const service = read("src/modules/inventory/services/inventory.service.ts");
assertIncludes(service, "officialCostingMethod: \"AVERAGE_COST\"", "Inventory report service resmi maliyet yöntemini sabitlemiyor.");
assertIncludes(service, "displayCostingMethod: parsed.costingMethod", "Inventory report service görünen maliyet yöntemini ayırmıyor.");
assertIncludes(service, "comparisonCostingModeEnabled: parsed.costingMethod !== \"AVERAGE_COST\"", "Inventory report service karşılaştırma modunu işaretlemiyor.");
assertIncludes(service, "resmi maliyet otoritesi daima ağırlıklı ortalama maliyettir", "Resmi maliyet helper notu eksik.");

const manager = read("src/ui/admin/inventory-manager.tsx");
assertIncludes(manager, "labels.reportOfficialCostingMethod", "Inventory manager resmi maliyet etiketini göstermiyor.");
assertIncludes(manager, "labels.reportComparisonCostingMode", "Inventory manager görünen maliyet modunu göstermiyor.");
assertIncludes(manager, "Bu seçim yalnızca karşılaştırma görünümünü değiştirir; resmi maliyet yöntemi değişmez.", "Inventory manager karşılaştırma modu açıklamasını göstermiyor.");

console.log("Sprint 4 inventory doğrulamaları başarıyla geçti.");
