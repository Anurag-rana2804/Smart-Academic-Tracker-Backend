const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: String,
  email: String,
  password: String,

  role: {
    type: String,
    enum: ["admin", "faculty", "student"],
  },

  mobile: String,
  dob: String,
  rollNo: String,
  branch: String,
  fatherName: String,
  motherName: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },

});

module.exports =
  mongoose.models.User ||
  mongoose.model("User", userSchema);
