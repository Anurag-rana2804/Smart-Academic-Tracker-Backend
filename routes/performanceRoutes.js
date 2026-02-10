const express = require("express");
const Performance = require("../models/Performance");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ✅ Upload Marks (Faculty Only)
router.post(
  "/add",
  authMiddleware,
  roleMiddleware("faculty"),
  async (req, res) => {
    try {
      const record = await Performance.create(req.body);
      res.json({ msg: "Marks Uploaded ✅", record });
    } catch (err) {
      res.status(500).json({ msg: "Error", err });
    }
  }
);

// ✅ View Records (Faculty Only)
router.get(
  "/all",
  authMiddleware,
  roleMiddleware("faculty"),
  async (req, res) => {
    try {
      const records = await Performance.find().populate(
        "studentId",
        "name email"
      );
      res.json(records);
    } catch (err) {
      res.status(500).json({ msg: "Error", err });
    }
  }
);


/* ✅ Student View Own Records */
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const records = await Performance.find({
        studentId: req.user.id,
      });

      res.json(records);
    } catch (err) {
      res.status(500).json({ msg: "Error", err });
    }
  }
);

/* ✅ Faculty View At-Risk Students */
router.get(
  "/risk-report",
  authMiddleware,
  roleMiddleware("faculty"),
  async (req, res) => {
    try {
      const records = await Performance.find().populate(
        "studentId",
        "name email"
      );

      // ✅ AI Risk Prediction Logic
      const report = records.map((r) => {
        let risk = "Low Risk ✅";

        if (r.marks < 40 || r.attendance < 60) {
          risk = "High Risk ❌";
        } else if (r.marks < 70 || r.attendance < 80) {
          risk = "Medium Risk ⚠️";
        }

        return {
          student: r.studentId.name,
          subject: r.subject,
          marks: r.marks,
          attendance: r.attendance,
          risk,
        };
      });

      res.json(report);
    } catch (err) {
      res.status(500).json({ msg: "Error", err });
    }
  }
);

/* ✅ Student Dashboard Summary API */
router.get(
  "/summary",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const records = await Performance.find({
        studentId: req.user.id,
      });

      if (records.length === 0) {
        return res.json({
          avgMarks: 0,
          avgAttendance: 0,
          risk: "No Data Yet",
        });
      }

      // ✅ Calculate Average Marks & Attendance
      const totalMarks = records.reduce((sum, r) => sum + r.marks, 0);
      const totalAttendance = records.reduce(
        (sum, r) => sum + r.attendance,
        0
      );

      const avgMarks = Math.round(totalMarks / records.length);
      const avgAttendance = Math.round(totalAttendance / records.length);

      // ✅ AI Risk Logic
      let risk = "Low Risk ✅";

      if (avgMarks < 40 || avgAttendance < 60) {
        risk = "High Risk ❌";
      } else if (avgMarks < 70 || avgAttendance < 80) {
        risk = "Medium Risk ⚠️";
      }

      res.json({
        avgMarks,
        avgAttendance,
        risk,
      });
    } catch (err) {
      res.status(500).json({ msg: "Error", err });
    }
  }
);

module.exports = router;
