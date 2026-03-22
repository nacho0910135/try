import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const rootDir = process.cwd();
const backendEnvPath = path.join(rootDir, "backend", ".env");

const readBackendEnv = async () => {
  try {
    const content = await fs.readFile(backendEnvPath, "utf8");
    return content.split(/\r?\n/).reduce((accumulator, line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        return accumulator;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^"(.*)"$/, "$1");

      accumulator[key] = value;
      return accumulator;
    }, {});
  } catch (_error) {
    return {};
  }
};

const cleanupOldBackups = async (backupRoot, retentionDays) => {
  const entries = await fs.readdir(backupRoot, { withFileTypes: true });
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

  await Promise.all(
    entries.map(async (entry) => {
      if (!entry.isDirectory()) {
        return;
      }

      const fullPath = path.join(backupRoot, entry.name);
      const stats = await fs.stat(fullPath);

      if (stats.mtimeMs < cutoff) {
        await fs.rm(fullPath, { recursive: true, force: true });
      }
    })
  );
};

const run = async () => {
  const fileEnv = await readBackendEnv();
  const env = {
    ...fileEnv,
    ...process.env
  };

  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required in backend/.env or current environment");
  }

  const backupRoot = path.resolve(rootDir, env.BACKUP_DIR || "backups/mongo");
  const retentionDays = Number(env.BACKUP_RETENTION_DAYS || 7);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputDir = path.join(backupRoot, timestamp);

  await fs.mkdir(outputDir, { recursive: true });

  try {
    await execFileAsync("mongodump", ["--uri", env.MONGODB_URI, "--out", outputDir], {
      windowsHide: true
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(
        "mongodump no esta instalado o no esta disponible en PATH. Instala MongoDB Database Tools."
      );
    }

    throw error;
  }

  await cleanupOldBackups(backupRoot, retentionDays);

  console.log(
    JSON.stringify({
      success: true,
      backupDir: outputDir,
      retentionDays
    })
  );
};

run().catch((error) => {
  console.error(
    JSON.stringify({
      success: false,
      message: error.message
    })
  );
  process.exit(1);
});
