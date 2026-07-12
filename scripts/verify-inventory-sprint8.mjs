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

const exportsPage = read("src/app/[locale]/admin/(panel)/inventory/exports/page.tsx");
assertIncludes(exportsPage, "pageVariant=\"exports\"", "Dışa aktarım ayrı ekranı bulunamadı.");

const shared = read("src/app/[locale]/admin/(panel)/inventory/_shared.ts");
assertIncludes(shared, "listInventoryExportHistory()", "Inventory route context export geçmişini yüklemiyor.");
assertIncludes(shared, "pageVariant === \"exports\"", "Inventory route context sayfa varyantına göre ayrışmıyor.");

const service = read("src/modules/inventory/services/inventory.service.ts");
assertIncludes(service, "async listInventoryExportHistory()", "Inventory export geçmişi service metodu eksik.");
assertIncludes(service, "rowNumber:", "Toplu işlem sonucu satır numarası taşımıyor.");
assertIncludes(service, "buildBulkOperationRowError", "Toplu işlem hata rehberi helper'ı eksik.");

const manager = read("src/ui/admin/inventory-manager.tsx");
assertIncludes(manager, "Dışa Aktarım Geçmişi", "Inventory manager export geçmişi ekranını göstermiyor.");
assertIncludes(manager, "Satır {row.rowNumber}", "Toplu işlem sonucu satır bazlı gösterilmiyor.");
assertIncludes(manager, "Öneri:", "Toplu işlem sonuçlarında hata önerisi gösterilmiyor.");

console.log("Sprint 8 inventory doğrulamaları başarıyla geçti.");
