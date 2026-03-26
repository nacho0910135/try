import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { Property } from "../models/Property.js";
import { User } from "../models/User.js";
import {
  REALISTIC_SEED_TOTAL,
  generateRealisticSeedProperties,
  realisticSeedUserDefaults
} from "./realisticSeedData.js";
import { assertSafeToSeed } from "./seedSafety.js";

const ensureUser = async (defaults) => {
  const existing = await User.findOne({ email: defaults.email });

  if (existing) {
    return existing;
  }

  return User.create(defaults);
};

const summarizeProperties = (properties) =>
  properties.reduce((summary, property) => {
    const key = `${property.businessType}-${property.propertyType}`;
    summary[key] = (summary[key] || 0) + 1;
    return summary;
  }, {});

const runRealisticSeed = async () => {
  assertSafeToSeed("seed:realistic-500");
  await connectDatabase();

  const users = await Promise.all(realisticSeedUserDefaults.map((user) => ensureUser(user)));
  const admin = users.find((user) => user.role === "admin");
  const sellers = users.filter((user) => user.role !== "admin");

  if (!admin) {
    throw new Error("Realistic seed requires an admin user.");
  }

  const properties = generateRealisticSeedProperties({
    adminId: admin._id,
    sellers
  });

  const operations = properties.map(({ createdAt, ...property }) => ({
    updateOne: {
      filter: { slug: property.slug },
      update: {
        $set: {
          ...property,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt
        }
      },
      upsert: true
    }
  }));

  const result = await Property.bulkWrite(operations, { ordered: false });
  const breakdown = summarizeProperties(properties);

  console.log(
    `Realistic CRC seed synced successfully. Total: ${properties.length}/${REALISTIC_SEED_TOTAL}, inserted: ${
      result.upsertedCount || 0
    }, updated: ${result.modifiedCount || 0}`
  );
  console.log("Breakdown:", breakdown);

  await mongoose.connection.close();
};

runRealisticSeed().catch(async (error) => {
  console.error("Realistic seed failed", error);
  await mongoose.connection.close();
  process.exit(1);
});
