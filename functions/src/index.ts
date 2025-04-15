import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express, { Request, Response } from "express";
import cors from "cors";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Setup Express
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// เพิ่มสินค้า
app.post("/addProduct", async (req: Request, res: Response) => {
  const { name, expirationDate, location, imageUrl, category, quantity, userId } = req.body;

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!name || !expirationDate || !location || !category || !userId) {
    return res.status(400).send({ success: false, message: "Missing required fields." });
  }

  try {
    // บันทึกข้อมูลลง Firestore
    await db.collection("products").add({
      name,
      expirationDate,
      location,
      imageUrl,
      category,
      quantity,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // สำเร็จ
    return res.status(200).send({ success: true, message: "Product added successfully." });
  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).send({ success: false, message: "Internal server error." });
  }
});

// Export Express app เป็น Firebase Function
export const api = functions.https.onRequest(app);
