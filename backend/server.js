const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  socket.on("addProduct", async (product) => {
    try {
      await db.collection("products").add(product);
      io.emit("productAdded", product);
    } catch (err) {
      console.error("❌ Error writing to Firestore:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("🚫 Client disconnected:", socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
