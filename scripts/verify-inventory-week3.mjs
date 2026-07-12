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

const contracts = read("src/modules/inventory/contracts/inventory.contract.ts");
assertIncludes(contracts, "export type AdminInventoryReportsQuery", "Rapor sorgu sözleşmesi eklenmedi.");
assertIncludes(contracts, "comparison: AdminInventoryReportPeriodComparison", "Rapor dönem kıyası sözleşmesi eksik.");

const service = read("src/modules/inventory/services/inventory.service.ts");
assertIncludes(service, "inventory:reports:dashboard:v2", "Rapor cache sürümü güncellenmedi.");
assertIncludes(service, "comparePreviousPeriod", "Rapor servisinde önceki dönem kıyası uygulanmıyor.");
assertIncludes(service, "resolveInventoryUnitCostByPreference", "Raporlarda alternatif maliyet görünümü uygulanmıyor.");

const shared = read("src/app/[locale]/admin/(panel)/inventory/_shared.ts");
assertIncludes(shared, "reportPeriodDays", "Inventory route context rapor dönem filtresini taşımıyor.");
assertIncludes(shared, "reportCostingMethod", "Inventory route context rapor maliyet görünümünü taşımıyor.");

const manager = read("src/ui/admin/inventory-manager.tsx");
assertIncludes(manager, "labels.reportPeriod7Days", "Inventory manager rapor dönem seçimlerini göstermiyor.");
assertIncludes(manager, "labels.reportCostingMethod", "Inventory manager maliyet görünüm seçimini göstermiyor.");
assertIncludes(manager, "reports.comparison.current", "Inventory manager dönem kıyas kartlarını göstermiyor.");

console.log("Hafta 3 kapanış doğrulamaları başarıyla geçti.");
