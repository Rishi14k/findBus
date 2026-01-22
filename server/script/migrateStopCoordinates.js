require("dotenv").config();
const mongoose = require("mongoose");
const Stop = require("../models/Stop"); // adjust path if needed

const migrateCoordinates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const stops = await Stop.find();
    console.log(`🔍 Found ${stops.length} stops`);

    for (const stop of stops) {
      if (!stop.location?.coordinates?.length) continue;

      const [lat, lng] = stop.location.coordinates;

      // simple sanity check
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        stop.location.coordinates = [lng, lat];
        await stop.save();
        console.log(`✔ Updated stop: ${stop.name}`);
      } else {
        console.log(`⚠ Skipped stop: ${stop.name} (invalid coords)`);
      }
    }

    console.log("🎉 Migration completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed", error);
    process.exit(1);
  }
};

migrateCoordinates();
