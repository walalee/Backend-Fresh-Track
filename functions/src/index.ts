import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express, { Request, Response } from "express";
import cors from "cors";

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// เพิ่มสินค้า
app.post("/addProduct", async (req: Request, res: Response) => {
  const { name, expirationDate, location, imageUrl, category, quantity, userId } = req.body;

  if (!name || !expirationDate || !location || !category || !userId) {
    return res.status(400).send({ success: false, message: "Missing required fields." });
  }

  try {
    const product = {
      name,
      expirationDate: admin.firestore.Timestamp.fromDate(new Date(expirationDate)),
      location,
      imageUrl,
      category,
      quantity: quantity || 1,
      addedAt: admin.firestore.Timestamp.now(),
      userId
    };

    const docRef = await db.collection("Products").add(product);
    res.status(200).send({ success: true, id: docRef.id });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).send({ success: false, message: error });
  }
});

// ดึงสินค้าทั้งหมดของ user
app.get("/getProducts/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const snapshot = await db.collection("Products")
      .where("userId", "==", userId)
      .orderBy("addedAt", "desc")
      .get();

    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send({ success: false, message: error });
  }
});

// ลบสินค้า
app.delete("/deleteProduct/:productId", async (req: Request, res: Response) => {
  const { productId } = req.params;
  try {
    await db.collection("Products").doc(productId).delete();
    res.status(200).send({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send({ success: false, message: error });
  }
});

export const api = functions.https.onRequest(app);
