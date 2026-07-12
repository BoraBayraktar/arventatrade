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
assertIncludes(repository, "ürünü", "Inventory alert mesajları Türkçeleştirilmemiş.");
assertIncludes(repository, "async listInventoryOverviewMovements", "Overview movement ayrıştırması eksik.");

const service = read("src/modules/inventory/services/inventory.service.ts");
assertIncludes(service, "\"inventory:overview:v3\"", "Overview cache sürümü eksik.");
assertIncludes(service, "movementRelevantInventoryItemIds", "Overview hedef hareket yükleme optimizasyonu eksik.");

console.log("Sprint 12 inventory doğrulamaları başarıyla geçti.");
