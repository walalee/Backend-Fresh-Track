const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json()); // ✅ เพิ่มเพื่อให้รับ JSON ได้

// ✅ GET: ดึงข้อมูลสินค้าทั้งหมด
app.get("/api/products", async (req, res) => {
  try {
    const snapshot = await db.collection("Products").get();
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error getting products", error: error.message });
  }
});

// ✅ POST: เพิ่มสินค้าใหม่
app.post("/api/products", async (req, res) => {
  try {
    const {
      name,
      expirationDate,
      location,
      imageUrl,
      category,
      quantity,
      userId
    } = req.body;

    // ✅ ตรวจสอบข้อมูลเบื้องต้น
    if (!name || !expirationDate || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newProduct = {
      name,
      expirationDate,
      location: location || "",
      imageUrl: imageUrl || "",
      category: category || "",
      quantity: quantity || 0,
      userId,
      addedAt: admin.firestore.Timestamp.now()
    };

    const docRef = await db.collection("Products").add(newProduct);

    res.status(201).json({
      id: docRef.id,
      message: "Product added successfully"
    });

  } catch (error) {
    res.status(500).json({ message: "Error adding product", error: error.message });
  }
});

// ✅ export functions
exports.app = functions.https.onRequest(app);
