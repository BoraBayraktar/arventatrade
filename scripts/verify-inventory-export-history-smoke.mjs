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
assertIncludes(service, "recordInventoryExportHistory", "Export geçmişi service yazma metodu bulunamadı.");
assertIncludes(service, "listInventoryExportHistory", "Export geçmişi service okuma metodu bulunamadı.");
assertIncludes(service, "scopeLabel: \"Stok listesi CSV dışa aktarımı\"", "Export geçmişi service scope etiketini üretmiyor.");
assertIncludes(service, "filterCount:", "Export geçmişi service filtre sayısını üretmiyor.");

const route = read("src/app/api/admin/inventory/export/route.ts");
assertIncludes(route, "recordInventoryExportHistory", "Export route geçmiş kaydı oluşturmuyor.");
assertIncludes(route, "exportHistoryId", "Export route canlı akışta exportHistoryId dönmüyor.");
assertIncludes(route, "filterCount", "Export route filtre sayısını geri döndürmüyor.");

const shared = read("src/app/[locale]/admin/(panel)/inventory/_shared.ts");
assertIncludes(shared, "listInventoryExportHistory()", "Inventory shared context export geçmişini yüklemiyor.");

console.log("Inventory export history smoke doğrulamaları başarıyla geçti.");
