const mongoose = require("mongoose");

const performanceSchema =
  new mongoose.Schema({

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    subject: String,
    marks: Number,
    attendance: Number,

  });

module.exports =
  mongoose.model(
    "Performance",
    performanceSchema
  );
