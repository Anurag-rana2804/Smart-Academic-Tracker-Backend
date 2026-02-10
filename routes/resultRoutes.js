const express = require("express");
const Result = require("../models/Result");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

/* ✅ Faculty Upload Semester Result */
router.post(
  "/add",
  authMiddleware,
  roleMiddleware("faculty"),
  async (req, res) => {
    try {
      const result = await Result.create(req.body);
      res.json({ msg: "Result Uploaded ✅", result });
    } catch (err) {
      res.status(500).json({ msg: "Error", err });
    }
  }
);

/* ✅ Student View Own Results */
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const results = await Result.find({
        studentId: req.user.id,
      });

      res.json(results);
    } catch (err) {
      res.status(500).json({ msg: "Error", err });
    }
  }
);

module.exports = router;
