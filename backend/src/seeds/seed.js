import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { Favorite } from "../models/Favorite.js";
import { Lead } from "../models/Lead.js";
import { Property } from "../models/Property.js";
import { SavedSearch } from "../models/SavedSearch.js";
import { User } from "../models/User.js";
import { seedProperties, seedUsers } from "./seedData.js";

const runSeed = async () => {
  await connectDatabase();

  await Promise.all([
    Favorite.deleteMany({}),
    Lead.deleteMany({}),
    SavedSearch.deleteMany({}),
    Property.deleteMany({}),
    User.deleteMany({})
  ]);

  const users = await User.create(seedUsers);

  const owners = {
    adminId: users.find((user) => user.role === "admin")._id,
    agentId: users.find((user) => user.role === "agent")._id,
    ownerId: users.find((user) => user.role === "owner")._id,
    viewerId:
      users.find((user) => user.email === "sofia@casacr.com")?._id ||
      users.find((user) => user.role === "owner")._id
  };

  const properties = await Property.create(seedProperties(owners));

  await Favorite.create([
    { user: owners.viewerId, property: properties[0]._id },
    { user: owners.viewerId, property: properties[4]._id }
  ]);

  await SavedSearch.create([
    {
      user: owners.viewerId,
      name: "Casas en Escazu",
      filters: {
        businessType: "sale",
        propertyType: "house",
        province: "San Jose",
        canton: "Escazu"
      }
    }
  ]);

  await Lead.create([
    {
      property: properties[0]._id,
      fromUser: owners.viewerId,
      toUser: owners.agentId,
      name: "Sofia Rojas",
      email: "sofia@casacr.com",
      phone: "+50670000004",
      message: "Hola, me interesa coordinar una visita este fin de semana.",
      source: "property-page"
    }
  ]);

  console.log("Seed completed successfully");
  await mongoose.connection.close();
};

runSeed().catch(async (error) => {
  console.error("Seed failed", error);
  await mongoose.connection.close();
  process.exit(1);
});
