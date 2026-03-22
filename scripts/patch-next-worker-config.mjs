import fs from "node:fs";
import path from "node:path";

const targetPath = path.join(
  process.cwd(),
  "node_modules",
  "next",
  "dist",
  "export",
  "index.js"
);

if (!fs.existsSync(targetPath)) {
  console.log("[patch-next-worker-config] Next export worker file not found, skipping.");
  process.exit(0);
}

const source = fs.readFileSync(targetPath, "utf8");

if (source.includes("const sanitizeForWorker = (value)=>JSON.parse(JSON.stringify(value")) {
  console.log("[patch-next-worker-config] Patch already applied.");
  process.exit(0);
}

const marker = "    const exportPagesInBatches = async (worker, exportPaths, renderResumeDataCachesByPage)=>{";
const helper =
  "    const sanitizeForWorker = (value)=>JSON.parse(JSON.stringify(value, (_key, currentValue)=>typeof currentValue === 'function' ? undefined : currentValue));\n" +
  "    const nextConfigSerializable = sanitizeForWorker(nextConfig);\n" +
  "    const exportPagesInBatches = async (worker, exportPaths, renderResumeDataCachesByPage)=>{";

const beforePatched = source.replace(marker, helper);

if (beforePatched === source) {
  console.error("[patch-next-worker-config] Could not insert sanitize helper.");
  process.exit(1);
}

const originalPayload = `        return (await Promise.all(batches.map(async (batch)=>worker.exportPages({
                buildId,
                exportPaths: batch,
                parentSpanId: span.getId(),
                pagesDataDir,
                renderOpts,
                options,
                dir,
                distDir,
                outDir,
                nextConfig,
                cacheHandler: nextConfig.cacheHandler,
                cacheMaxMemorySize: nextConfig.cacheMaxMemorySize,
                fetchCache: true,
                fetchCacheKeyPrefix: nextConfig.experimental.fetchCacheKeyPrefix,
                renderResumeDataCachesByPage
            })))).flat();`;

const patchedPayload = `        return (await Promise.all(batches.map(async (batch)=>{
                const payload = sanitizeForWorker({
                buildId,
                exportPaths: batch,
                parentSpanId: span.getId(),
                pagesDataDir,
                renderOpts,
                options,
                dir,
                distDir,
                outDir,
                nextConfig: nextConfigSerializable,
                cacheHandler: nextConfigSerializable.cacheHandler,
                cacheMaxMemorySize: nextConfigSerializable.cacheMaxMemorySize,
                fetchCache: true,
                fetchCacheKeyPrefix: nextConfigSerializable.experimental.fetchCacheKeyPrefix,
                renderResumeDataCachesByPage
            });
                return worker.exportPages(payload);
            }))).flat();`;

const patched = beforePatched.replace(originalPayload, patchedPayload);

if (patched === beforePatched) {
  console.error("[patch-next-worker-config] Could not patch export worker payload.");
  process.exit(1);
}

fs.writeFileSync(targetPath, patched, "utf8");
console.log("[patch-next-worker-config] Patch applied successfully.");
