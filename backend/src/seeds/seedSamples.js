import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { Property } from "../models/Property.js";
import { User } from "../models/User.js";
import { createSlug } from "../utils/slug.js";
import { seedProperties } from "./seedData.js";

const ensureUser = async (criteria, defaults) => {
  const existing = await User.findOne(criteria);

  if (existing) {
    return existing;
  }

  return User.create(defaults);
};

const runSeedSamples = async () => {
  await connectDatabase();

  const admin = await ensureUser(
    { email: "admin@casacr.com" },
    {
      name: "BienesRaicesCR Admin",
      email: "admin@casacr.com",
      password: "Admin12345",
      phone: "+50670000001",
      role: "admin",
      avatar: "https://placehold.co/200x200/png?text=Admin"
    }
  );

  const agent = await ensureUser(
    { role: "agent" },
    {
      name: "Laura Mendez",
      email: "laura@casacr.com",
      password: "Laura12345",
      phone: "+50670000002",
      role: "agent",
      avatar: "https://placehold.co/200x200/png?text=Laura"
    }
  );

  const owner = await ensureUser(
    { role: "owner" },
    {
      name: "Diego Vargas",
      email: "diego@casacr.com",
      password: "Diego12345",
      phone: "+50670000003",
      role: "owner",
      avatar: "https://placehold.co/200x200/png?text=Diego"
    }
  );

  const sampleProperties = seedProperties({
    adminId: admin._id,
    agentId: agent._id,
    ownerId: owner._id,
    userId: owner._id
  }).map((property) => ({
    ...property,
    slug: createSlug(`${property.title}-${property.address?.canton || ""}`)
  }));

  const bulkOperations = sampleProperties.map((property) => ({
    updateOne: {
      filter: { slug: property.slug },
      update: {
        $set: {
          ...property,
          updatedAt: new Date()
        }
      },
      upsert: true
    }
  }));

  const result = await Property.bulkWrite(bulkOperations);

  const insertedCount = result.upsertedCount || 0;
  const updatedCount = result.modifiedCount || 0;

  console.log(
    `Sample properties synced successfully. Inserted: ${insertedCount}, updated: ${updatedCount}`
  );
  await mongoose.connection.close();
};

runSeedSamples().catch(async (error) => {
  console.error("Sample seed failed", error);
  await mongoose.connection.close();
  process.exit(1);
});
