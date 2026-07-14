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
assertIncludes(schema, "model InventoryExportHistory", "InventoryExportHistory modeli bulunamadı.");

const repository = read("src/modules/inventory/repositories/inventory.repository.ts");
assertIncludes(repository, "createInventoryExportHistory", "Export geçmişi repository yazma metodu bulunamadı.");
assertIncludes(repository, "listInventoryExportHistories", "Export geçmişi repository okuma metodu bulunamadı.");

const service = read("src/modules/inventory/services/inventory.service.ts");
assertIncludes(service, "scopeLabel: \"Stok listesi CSV dışa aktarımı\"", "Export geçmişi service scope etiketi üretmiyor.");
assertIncludes(service, "filterCount:", "Export geçmişi service filtre sayısını üretmiyor.");
assertIncludes(service, "hasFilters:", "Export geçmişi service filtre var/yok bilgisini üretmiyor.");
assertIncludes(service, "recordInventoryExportHistory(input", "Export geçmişi service yazma akışı bulunamadı.");

const route = read("src/app/api/admin/inventory/export/route.ts");
assertIncludes(route, "exportHistoryId", "Export route canlı export history kimliğini döndürmüyor.");
assertIncludes(route, "scope: \"inventory_export\"", "Export route audit scope bilgisini yazmıyor.");
assertIncludes(route, "hasFilters", "Export route filtre var/yok bilgisini dönmüyor.");

const ui = read("src/ui/admin/inventory-manager.tsx");
assertIncludes(ui, "item.scopeLabel", "Export geçmişi UI scope etiketini göstermiyor.");
assertIncludes(ui, "item.hasFilters ? `${item.filterCount} filtre ile` : \"Filtresiz\"", "Export geçmişi UI filtre yoğunluğunu göstermiyor.");

const smoke = read("scripts/verify-inventory-export-history-smoke.mjs");
assertIncludes(smoke, "exportHistoryId", "Export history smoke canlı akış kimliğini doğrulamıyor.");

console.log("Sprint 6 inventory doğrulamaları başarıyla geçti.");
