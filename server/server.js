import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoute from "./routes/auth.route.js";
import workerRoute from "./routes/worker.routes.js";
import adminRoute from "./routes/admin.routes.js";
import cookieParser from "cookie-parser";


dotenv.config();

const app = express();

// Middleware
app.use(express.json());


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // ✅ PATCH add karo
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(cookieParser());



app.use('/api/auth',authRoute)
app.use("/api/admin", adminRoute);
app.use("/api/worker", workerRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
 connectDB()
  console.log(`Server running on port ${PORT}`);
});