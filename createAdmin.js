const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

// ✅ Create Default Admin Account
const createAdmin = async () => {
  try {
    // Connect MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI);

    // Check if Admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("✅ Admin already exists!");
      process.exit();
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create Admin User
    const admin = await User.create({
      name: "Super Admin",
      email: "admin@college.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Admin Created Successfully!");
    console.log("📌 Login Credentials:");
    console.log("Email: admin@college.com");
    console.log("Password: admin123");

    process.exit();
  } catch (err) {
    console.log("❌ Error Creating Admin:", err);
    process.exit();
  }
};

createAdmin();
