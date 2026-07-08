import { notificationService } from "@/modules/system/services/notification.service";

async function main() {
  const limitRaw = process.argv[2];
  const limit = limitRaw ? Number(limitRaw) : 20;

  const result = await notificationService.processEmailQueue({
    limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
