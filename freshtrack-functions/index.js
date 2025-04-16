const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue; // ✅ ดึง FieldValue ออกมาใช้

// Setup Express
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// GET products
app.get("/api/products", async (req, res) => {
  try {
    const snapshot = await db.collection("Products").get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error getting products", error: error.message });
  }
});

// POST new product
app.post("/api/products", async (req, res) => {
  try {
    const { name, expirationDate, location, imageUrl, category, quantity, userId } = req.body;

    if (!name || !expirationDate || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newProduct = {
      name,
      expirationDate,
      location: location || "",
      imageUrl: imageUrl || "",
      category: category || "",
      quantity: quantity || 1,
      userId,
      addedAt: FieldValue.serverTimestamp() // ✅ ใช้ FieldValue ที่ import มา
    };

    const docRef = await db.collection("Products").add(newProduct);

    res.status(201).json({ id: docRef.id, message: "Product added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding product", error: error.message });
  }
});

// Export the Express app as a Firebase Cloud Function
exports.app = functions.https.onRequest(app);
