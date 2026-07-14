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

const service = read("src/modules/inventory/services/inventory.service.ts");
assertIncludes(service, "\"inventory:overview:v4\"", "Overview cache sürümü performans sprinti için güncellenmedi.");
assertIncludes(service, "includeWarehouseDistribution: false", "Overview ilk geçişte hafif proje üretmiyor.");
assertIncludes(service, "includeRecentMovements: false", "Overview ilk geçişte hareket yükünü devre dışı bırakmıyor.");
assertIncludes(service, "const productsForDecoration =", "Overview yalnızca gerekli ürünleri detaylandırmıyor.");
assertIncludes(service, "buildInventoryOverviewSummary", "Overview özet projeksiyonu ayrı helper'a taşınmadı.");

const repository = read("src/modules/inventory/repositories/inventory.repository.ts");
assertIncludes(repository, "async listInventoryOverviewMovements", "Overview hareket ayrıştırması repository'de bulunmuyor.");

const planDoc = read("docs/PARASUT_INVENTORY_REVISION_PLAN.md");
assertIncludes(planDoc, "Gerekirse raporlama projection tablolari", "Revizyon planında projection yönü bulunamadı.");

console.log("Sprint 5 inventory doğrulamaları başarıyla geçti.");
