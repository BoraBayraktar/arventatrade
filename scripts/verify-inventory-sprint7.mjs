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
assertIncludes(schema, "model UserInventoryPreference", "UserInventoryPreference modeli bulunamadi.");
assertIncludes(schema, "inventoryPreference UserInventoryPreference?", "User modeli tercih iliskisi icermiyor.");

const repository = read("src/modules/inventory/repositories/inventory.repository.ts");
assertIncludes(repository, "async getUserInventoryPreferences", "Repository tercih okuma metodu eksik.");
assertIncludes(repository, "async upsertUserInventoryPreferences", "Repository tercih kaydetme metodu eksik.");

const service = read("src/modules/inventory/services/inventory.service.ts");
assertIncludes(service, "async getUserInventoryPreferences", "Service tercih okuma metodu eksik.");
assertIncludes(service, "async saveUserInventoryPreferences", "Service tercih kaydetme metodu eksik.");

const route = read("src/app/api/admin/inventory/preferences/route.ts");
assertIncludes(route, "export async function GET()", "Tercih GET route'u eksik.");
assertIncludes(route, "export async function PUT(request: Request)", "Tercih PUT route'u eksik.");

const manager = read("src/ui/admin/inventory-manager.tsx");
assertIncludes(manager, "inventoryPreferences: AdminInventoryListPreferences;", "InventoryManager tercih prop'u eksik.");
assertIncludes(manager, "fetch(\"/api/admin/inventory/preferences\"", "InventoryManager tercih kaydi API cagrisi eksik.");

console.log("Sprint 7 inventory doğrulamaları başarıyla geçti.");
