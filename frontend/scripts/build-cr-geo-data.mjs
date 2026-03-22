import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceDir =
  process.argv[2] || "C:/Users/jose1/Documents/CR_distritos_geojson-master/geojson";
const outputDir = path.resolve(__dirname, "../public/geo");
const districtsOutputDir = path.join(outputDir, "districts");

const provinceNames = {
  "1": "San Jose",
  "2": "Alajuela",
  "3": "Cartago",
  "4": "Heredia",
  "5": "Guanacaste",
  "6": "Puntarenas",
  "7": "Limon"
};

const toDisplayName = (value = "") =>
  String(value)
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, "utf8"));

const buildProvinceFeatureCollection = async () => {
  const features = await Promise.all(
    Object.entries(provinceNames).map(async ([code, name]) => {
      const raw = await readJson(path.join(sourceDir, `${code}.geojson`));

      return {
        type: "Feature",
        properties: {
          code,
          name
        },
        geometry: raw.geometry
      };
    })
  );

  return {
    type: "FeatureCollection",
    features
  };
};

const buildDistrictFeatureCollections = async () => {
  const files = await fs.readdir(sourceDir);
  const districtFiles = files.filter((file) => /^\d{5}\.geojson$/.test(file));
  const groupedByProvince = new Map();

  for (const file of districtFiles) {
    const raw = await readJson(path.join(sourceDir, file));
    const code = file.replace(".geojson", "");
    const provinceCode = code[0];
    const feature = {
      type: "Feature",
      properties: {
        code,
        provinceCode,
        province: toDisplayName(raw.properties?.Provincia || provinceNames[provinceCode] || ""),
        canton: toDisplayName(raw.properties?.Canton || ""),
        district: toDisplayName(raw.properties?.Distrito || ""),
        name: toDisplayName(raw.properties?.Distrito || "")
      },
      geometry: raw.geometry
    };

    if (!groupedByProvince.has(provinceCode)) {
      groupedByProvince.set(provinceCode, []);
    }

    groupedByProvince.get(provinceCode).push(feature);
  }

  return groupedByProvince;
};

const main = async () => {
  await fs.mkdir(districtsOutputDir, { recursive: true });

  const provinces = await buildProvinceFeatureCollection();
  await fs.writeFile(
    path.join(outputDir, "cr-provinces.json"),
    JSON.stringify(provinces)
  );

  const districtGroups = await buildDistrictFeatureCollections();

  await Promise.all(
    [...districtGroups.entries()].map(([provinceCode, features]) =>
      fs.writeFile(
        path.join(districtsOutputDir, `${provinceCode}.json`),
        JSON.stringify({
          type: "FeatureCollection",
          features: features.sort((first, second) =>
            first.properties.code.localeCompare(second.properties.code)
          )
        })
      )
    )
  );

  console.log(`Geo data built in ${outputDir}`);
};

main().catch((error) => {
  console.error("Geo data build failed", error);
  process.exit(1);
});
