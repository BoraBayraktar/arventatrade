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

const repository = read("src/modules/inventory/repositories/inventory.repository.ts");
assertIncludes(repository, "async listInventoryReportLevels()", "Repository rapor stok seviyeleri metodu eksik.");
assertIncludes(repository, "categoryId: true", "Repository rapor seviyelerinde kategori secimi eksik.");
assertIncludes(repository, "productType: true", "Repository rapor seviyelerinde urun tipi secimi eksik.");
assertIncludes(repository, "warehouse: {", "Repository rapor hareketlerinde depo secimi eksik.");
assertIncludes(repository, "inventoryItemId: true", "Repository rapor hareketlerinde inventoryItemId secimi eksik.");

const service = read("src/modules/inventory/services/inventory.service.ts");
assertIncludes(service, "categoryId: z.string().trim().min(1).optional()", "Service rapor kategori filtresi eksik.");
assertIncludes(service, "warehouseCode: z.string().trim().min(1).max(32).optional()", "Service rapor depo filtresi eksik.");
assertIncludes(service, "const filterOptions: AdminInventoryReportsResult[\"filterOptions\"]", "Service rapor filtre secenekleri eksik.");
assertIncludes(service, "const filteredLevels = levels.filter", "Service rapor seviye filtreleme eksik.");
assertIncludes(service, "const filteredMovements = movements.filter", "Service rapor hareket filtreleme eksik.");
assertIncludes(service, "filterOptions,", "Service sonucunda filterOptions donulmuyor.");

const shared = read("src/app/[locale]/admin/(panel)/inventory/_shared.ts");
assertIncludes(shared, "reportCategoryFilter?: string;", "Route context rapor kategori query alani eksik.");
assertIncludes(shared, "reportMovementTypeFilter?: string;", "Route context rapor hareket tipi query alani eksik.");
assertIncludes(shared, "reportCategoryFilter: searchParams.reportCategoryFilter ?? \"all\"", "Route context varsayilan rapor kategori filtresi eksik.");
assertIncludes(shared, "reportMovementTypeFilter: searchParams.reportMovementTypeFilter ?? \"all\"", "Route context varsayilan rapor hareket filtresi eksik.");

const manager = read("src/ui/admin/inventory-manager.tsx");
assertIncludes(manager, "reportCategoryFilter: string;", "InventoryManager rapor kategori query prop'u eksik.");
assertIncludes(manager, "const reportCategoryOptions = useMemo(", "InventoryManager rapor kategori secenekleri eksik.");
assertIncludes(manager, "const hasActiveReportFilters = useMemo(", "InventoryManager aktif rapor filtre kontrolu eksik.");
assertIncludes(manager, "labels.reportFiltersTitle", "InventoryManager rapor filtre paneli eksik.");

const translations = read("src/i18n/tr.json");
assertIncludes(translations, "\"inventoryReportFiltersTitle\": \"Rapor filtreleri\"", "Turkce rapor filtre basligi eksik.");
assertIncludes(translations, "\"inventoryReportMovementTypeFilter\": \"Hareket tipi\"", "Turkce rapor hareket tipi etiketi eksik.");

console.log("Sprint 7 inventory doğrulamaları başarıyla geçti.");
