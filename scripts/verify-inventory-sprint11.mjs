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
assertIncludes(service, "getExternalStockEventMonitoring", "Harici stok event monitoring service metodu eksik.");

const shared = read("src/app/[locale]/admin/(panel)/inventory/_shared.ts");
assertIncludes(shared, "getExternalStockEventMonitoring()", "Inventory route context harici event monitoring yüklemiyor.");

const manager = read("src/ui/admin/inventory-manager.tsx");
assertIncludes(manager, "Harici stok event akışı", "Inventory manager harici stok event izleme kartını göstermiyor.");
assertIncludes(manager, "externalEventMonitoring", "Inventory manager external event monitoring prop'unu kullanmıyor.");

console.log("Sprint 11 inventory doğrulamaları başarıyla geçti.");
