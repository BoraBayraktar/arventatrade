import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const files = execSync("rg -l \"export async function (POST|PUT|PATCH|DELETE)\" src/app/api", { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean);

const exemptPattern = /AUDIT_EXEMPT_REASON:\s*.+/;
const auditPattern = /auditLogService\.recordFromRequest\(|auditAnchorService\.|documentLifecycleService\.|documentDispatchLifecycleService\.|documentEvidencePackageService\./;
const failures = [];

for (const file of files) {
  const source = readFileSync(file, "utf8");
  if (source.includes("/notifications/") || source.includes("/system/")) {
    continue;
  }

  if (!auditPattern.test(source) && !exemptPattern.test(source)) {
    failures.push(file);
  }
}

if (failures.length > 0) {
  console.error("Audit kararı olmayan write endpointleri bulundu:");
  for (const file of failures) {
    console.error(`- ${file}`);
  }
  console.error("Her write endpoint audit üretmeli veya AUDIT_EXEMPT_REASON açıklaması taşımalıdır.");
  process.exit(1);
}

console.log(`Audit coverage kontrolü geçti. ${files.length} write endpoint tarandı.`);
