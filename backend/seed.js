require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB Connected");

  const existing = await User.findOne({ email: "admin@admin.com" });
  if (existing) {
    console.log("Admin account already exists!");
    console.log("Email: admin@admin.com");
    console.log("Role:", existing.role);
    await mongoose.disconnect();
    return;
  }

  const admin = await User.create({
    name: "Admin",
    email: "admin@admin.com",
    password: "admin123",
    role: "admin",
  });

  console.log("Admin account created successfully!");
  console.log("Email: admin@admin.com");
  console.log("Password: admin123");
  console.log("ID:", admin._id);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
