const express = require("express");
const PDFDocument = require("pdfkit");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

/* ✅ Generate Admit Card PDF */
router.get(
  "/midterm",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=MidTerm_AdmitCard.pdf"
      );

      const doc = new PDFDocument();
      doc.pipe(res);

      // ✅ University Header
      doc.fontSize(20).text("ITM University Gwalior", { align: "center" });
      doc.moveDown();

      doc.fontSize(16).text("MID TERM ADMIT CARD", { align: "center" });
      doc.moveDown();

      // ✅ Student Info
      doc.fontSize(12).text(`Student Name: ${req.user.name}`);
      doc.text(`Student Email: ${req.user.email}`);
      doc.text("Course: BCA Final Year");
      doc.text("Exam: Mid Term Examination");
      doc.moveDown();

      // ✅ Instructions
      doc.fontSize(14).text("Instructions:", { underline: true });
      doc.fontSize(12).text("1. Carry this admit card to exam hall.");
      doc.text("2. Bring your student ID card.");
      doc.text("3. Mobile phones are not allowed.");
      doc.moveDown();

      // ✅ Signature Footer
      doc.text("_________________________", { align: "right" });
      doc.text("Controller of Examination", { align: "right" });

      doc.end();
    } catch (err) {
      res.status(500).json({ msg: "PDF Error", err });
    }
  }
);

module.exports = router;
