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
assertIncludes(schema, "model InventoryHistoryEvent", "InventoryHistoryEvent modeli bulunamadı.");
assertIncludes(schema, "enum InventoryHistoryEventType", "InventoryHistoryEventType enum'u bulunamadı.");

const repository = read("src/modules/inventory/repositories/inventory.repository.ts");
assertIncludes(repository, "createInventoryHistoryEvent", "Inventory history create repository metodu bulunamadı.");
assertIncludes(repository, "listInventoryHistoryEvents", "Inventory history list repository metodu bulunamadı.");

const service = read("src/modules/inventory/services/inventory.service.ts");
assertIncludes(service, "private async recordHistory", "Inventory service history projection helper'ı bulunamadı.");
assertIncludes(service, "this.repository.listInventoryHistoryEvents(12)", "Operation history yeni projection kaynağından okunmuyor.");
assertIncludes(service, "eventType: \"BULK_OPERATION\"", "Toplu işlemler history projection'a yazılmıyor.");

const ui = read("src/ui/admin/inventory-manager.tsx");
assertIncludes(ui, "özel geçmiş projeksiyonundan", "UI hâlâ eski audit metnini gösteriyor.");

console.log("Sprint 5 inventory doğrulamaları başarıyla geçti.");
