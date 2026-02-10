const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const Issue = require("../models/Issue");
const Form = require("../models/Form");
const Performance = require("../models/Performance");

const router = express.Router();

/* ================= CREATE STUDENT ================= */
router.post(
  "/create-student",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const {
        name,
        email,
        mobile,
        dob,
        rollNo,
        fatherName,
        motherName,
        branch,
        password,
      } = req.body;

      const existing = await User.findOne({
        $or: [{ email }, { rollNo }],
      });

      if (existing) {
        return res
          .status(400)
          .json({ msg: "Student already exists ❌" });
      }

      const hashedPassword = await bcrypt.hash(
        password,
        10
      );

      const student = await User.create({
        name,
        email,
        mobile,
        dob,
        rollNo,
        fatherName,
        motherName,
        branch,
        password: hashedPassword,
        role: "student", // ✅ IMPORTANT
      });

      res.json({
        msg: "Student created successfully ✅",
        student,
      });
    } catch (err) {
      res.status(500).json({ msg: "Server Error", err });
    }
  }
);

/* ================= DASHBOARD SUMMARY ================= */
router.get(
  "/summary",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const students = await User.countDocuments({
        role: "student",
      });

      const faculty = await User.countDocuments({
        role: "faculty",
      });

      res.json({
        students,
        faculty,
        issues: 5,
        records: 20,
      });
    } catch (err) {
      res.status(500).json({ msg: "Error", err });
    }
  }
);

/* ================= GET STUDENTS (ADMIN) ================= */
router.get(
  "/students",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    const students = await User.find({
      role: "student",
    });

    res.json(students);
  }
);

/* ================= GET SINGLE USER ================= */
router.get(
  "/user/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    const user = await User.findById(
      req.params.id
    );

    res.json(user);
  }
);


// ================= ANALYTICS =================
router.get(
  "/analytics",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {

    try {

      // Users
      const totalStudents =
        await User.countDocuments({
          role: "student",
        });

      const totalFaculty =
        await User.countDocuments({
          role: "faculty",
        });

      // Issues
      const totalIssues =
        await Issue.countDocuments();

      // Forms
      const totalForms =
        await Form.countDocuments();

      // Performance Records
      const totalRecords =
        await Performance.countDocuments();

      res.json({
        students: totalStudents,
        faculty: totalFaculty,
        issues: totalIssues,
        forms: totalForms,
        records: totalRecords,
      });

    } catch (err) {
      res.status(500).json({
        msg: "Analytics Error",
        err,
      });
    }

  }
);

// ================= CREATE STUDENT (ADMIN) =================
router.post(
  "/create-student",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {

    try {

      const {
        name,
        email,
        mobile,
        dob,
        rollNo,
        fatherName,
        motherName,
        branch,
        password,
      } = req.body;

      // Check existing
      const exists = await User.findOne({
        $or: [{ email }, { rollNo }],
      });

      if (exists) {
        return res.status(400).json({
          msg: "Student already exists ❌",
        });
      }

      // Hash password
      const hashedPassword =
        await bcrypt.hash(password, 10);

      const student =
        await User.create({
          name,
          email,
          mobile,
          dob,
          rollNo,
          fatherName,
          motherName,
          branch,
          password: hashedPassword,
          role: "student",
        });

      res.json({
        msg: "Student Created ✅",
        student,
      });

    } catch (err) {
      res.status(500).json({
        msg: "Server Error",
        err,
      });
    }

  }
);

// ================= CREATE FACULTY (ADMIN) =================
router.post(
  "/create-faculty",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {

    try {

      const {
        name,
        email,
        mobile,
        branch,
        password,
      } = req.body;

      const exists = await User.findOne({
        email,
      });

      if (exists) {
        return res.status(400).json({
          msg: "Faculty already exists ❌",
        });
      }

      const hashedPassword =
        await bcrypt.hash(password, 10);

      const faculty =
        await User.create({
          name,
          email,
          mobile,
          branch,
          password: hashedPassword,
          role: "faculty",
        });

      res.json({
        msg: "Faculty Created ✅",
        faculty,
      });

    } catch (err) {
      res.status(500).json({
        msg: "Server Error",
        err,
      });
    }

  }
);

// ================= GET ALL STUDENTS =================
router.get(
  "/students",
  async (req, res) => {
    try {

      const students =
        await User.find({
          role: "student",
        }).select("-password");

      res.json(students);

    } catch (err) {
      res.status(500).json({
        msg: "Error fetching students",
      });
    }
  }
);


// ================= GET ALL FACULTY =================
router.get(
  "/faculty",
  async (req, res) => {

    try {

      const faculty =
        await User.find({
          role: "faculty",
        }).select("-password");

      res.json(faculty);

    } catch (err) {

      res.status(500).json({
        msg: "Error fetching faculty",
      });

    }

  }
);

// ================= DELETE USER =================
router.delete(
  "/delete/:id",
  async (req, res) => {

    try {

      const id = req.params.id;

      await User.findByIdAndDelete(id);

      res.json({
        msg: "User Deleted Successfully 🗑️",
      });

    } catch (err) {

      res.status(500).json({
        msg: "Delete Failed ❌",
      });

    }

  }
);

// ================= UPDATE USER =================
router.put(
  "/update/:id",
  async (req, res) => {

    try {

      const updatedUser =
        await User.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true }
        );

      res.json({
        msg: "User Updated",
        updatedUser,
      });

    } catch {
      res.status(500).json({
        msg: "Update Failed",
      });
    }
  }
);

// ================= GET SINGLE USER =================
router.get(
  "/user/:id",
  async (req, res) => {

    const user =
      await User.findById(
        req.params.id
      ).select("-password");

    res.json(user);
  }
);

module.exports = router;
