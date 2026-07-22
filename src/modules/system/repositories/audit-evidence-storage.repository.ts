import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { Client } from "minio";

type AuditEvidenceStorageConfig = {
  endpoint?: string;
  port: number;
  useSSL: boolean;
  accessKey?: string;
  secretKey?: string;
  bucket?: string;
  publicBaseUrl?: string;
  localDir: string;
};

function parseBool(value: string | undefined, fallback: boolean) {
  if (value === undefined) {
    return fallback;
  }

  return value === "1" || value.toLowerCase() === "true";
}

function getConfig(): AuditEvidenceStorageConfig {
  return {
    endpoint: process.env.AUDIT_WORM_ENDPOINT ?? process.env.MINIO_ENDPOINT,
    port: Number(process.env.AUDIT_WORM_PORT ?? process.env.MINIO_PORT ?? "9000"),
    useSSL: parseBool(process.env.AUDIT_WORM_USE_SSL ?? process.env.MINIO_USE_SSL, false),
    accessKey: process.env.AUDIT_WORM_ACCESS_KEY ?? process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.AUDIT_WORM_SECRET_KEY ?? process.env.MINIO_SECRET_KEY,
    bucket: process.env.AUDIT_WORM_BUCKET,
    publicBaseUrl: process.env.AUDIT_WORM_PUBLIC_BASE_URL,
    localDir: process.env.AUDIT_EVIDENCE_LOCAL_DIR ?? ".audit-evidence",
  };
}

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export class AuditEvidenceStorageRepository {
  private readonly config = getConfig();
  private readonly client = this.config.endpoint && this.config.accessKey && this.config.secretKey && this.config.bucket
    ? new Client({
        endPoint: this.config.endpoint,
        port: this.config.port,
        useSSL: this.config.useSSL,
        accessKey: this.config.accessKey,
        secretKey: this.config.secretKey,
      })
    : null;

  async putJson(args: {
    objectKey: string;
    payload: unknown;
  }) {
    const bytes = Buffer.from(JSON.stringify(args.payload, null, 2));

    if (this.client && this.config.bucket) {
      const exists = await this.client.bucketExists(this.config.bucket);
      if (!exists) {
        await this.client.makeBucket(this.config.bucket);
      }

      await this.client.putObject(this.config.bucket, args.objectKey, bytes, bytes.length, {
        "Content-Type": "application/json; charset=utf-8",
        "X-Amz-Meta-Audit-Immutable-Intent": "worm",
      });

      return {
        mode: "WORM_OBJECT_STORAGE",
        bucket: this.config.bucket,
        objectKey: args.objectKey,
        url: this.config.publicBaseUrl ? `${trimTrailingSlash(this.config.publicBaseUrl)}/${args.objectKey}` : null,
      };
    }

    const filePath = resolve(this.config.localDir, args.objectKey);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, bytes, { flag: "wx" });

    return {
      mode: "LOCAL_APPEND_ONLY_FILE",
      bucket: null,
      objectKey: filePath,
      url: null,
    };
  }
}
