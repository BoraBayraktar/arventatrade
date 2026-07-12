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

const eventsPage = read("src/app/[locale]/admin/(panel)/inventory/external-events/page.tsx");
assertIncludes(eventsPage, "pageVariant=\"external-events\"", "Harici eventler ayrı ekranı bulunamadı.");

const shared = read("src/app/[locale]/admin/(panel)/inventory/_shared.ts");
assertIncludes(shared, "\"external-events\"", "Inventory route context external-events varyantını tanımıyor.");
assertIncludes(shared, "getExternalStockEventMonitoring()", "External event monitoring route context içinde yüklenmiyor.");

const manager = read("src/ui/admin/inventory-manager.tsx");
assertIncludes(manager, "Harici Eventler", "Inventory manager üst navigasyonda harici event sekmesini göstermiyor.");
assertIncludes(manager, "pageVariant === \"external-events\"", "Inventory manager external events varyantını işlemiyor.");

const runbook = read("docs/INVENTORY_EXTERNAL_EVENT_RUNBOOK.md");
assertIncludes(runbook, "EXTERNAL_STOCK_MAPPING_NOT_FOUND", "Harici event runbook mapping not found durumunu içermiyor.");
assertIncludes(runbook, "DUPLICATE", "Harici event runbook duplicate durumunu içermiyor.");

const exportSmoke = read("scripts/verify-inventory-export-history-smoke.mjs");
assertIncludes(exportSmoke, "recordInventoryExportHistory", "Export smoke verify export kaydını doğrulamıyor.");

console.log("Hafta 2 kapanış doğrulamaları başarıyla geçti.");
