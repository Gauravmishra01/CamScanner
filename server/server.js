const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
require("dotenv").config();

const cloudinary = require("./config/cloudinary");
const { db } = require("./config/firebase");
const verifyToken = require("./middleware/authMiddleware");
const { processImage } = require("./utils/imageProcessor");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// --- ROUTES ---

// 1. Upload Route (With Crash Protection)
app.post(
  "/api/upload",
  verifyToken,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded.");

    try {
      const originalPath = req.file.path;
      console.log(`Received file: ${originalPath}`);

      // A. Upload Original
      const originalUpload = await cloudinary.uploader.upload(originalPath, {
        folder: "openscan/original",
      });

      // B. Run Processor (Now Robust!)
      const processedPath = await processImage(originalPath);

      // C. Upload Processed
      const processedUpload = await cloudinary.uploader.upload(processedPath, {
        folder: "openscan/processed",
      });

      let docId = "offline_mode";

      // D. Save to DB (Wrapped in try/catch so it DOES NOT CRASH server)
      try {
        const docRef = await db.collection("documents").add({
          userId: req.user.uid,
          filename: req.file.originalname,
          originalUrl: originalUpload.secure_url,
          processedUrl: processedUpload.secure_url,
          createdAt: new Date().toISOString(),
        });
        docId = docRef.id;
      } catch (dbError) {
        console.error(
          "⚠️ Database Error (Ignored to keep app running):",
          dbError.message,
        );
      }

      // Cleanup
      try {
        if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
        if (fs.existsSync(processedPath) && processedPath !== originalPath) {
          fs.unlinkSync(processedPath);
        }
      } catch (cleanupErr) {
        console.error("Cleanup Error:", cleanupErr);
      }

      // Success Response
      res.json({
        id: docId,
        originalUrl: originalUpload.secure_url,
        processedUrl: processedUpload.secure_url,
      });
    } catch (error) {
      console.error("Critical Upload Error:", error);
      res.status(500).send("Processing failed");
    }
  },
);

// 2. Gallery Route (Manual Sort to prevent 500 Errors)
app.get("/api/gallery", verifyToken, async (req, res) => {
  try {
    const snapshot = await db
      .collection("documents")
      .where("userId", "==", req.user.uid)
      .get();

    let docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Sort manually in JS
    docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(docs);
  } catch (error) {
    console.error("Gallery Error:", error);
    res.status(500).send("Error fetching gallery");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
