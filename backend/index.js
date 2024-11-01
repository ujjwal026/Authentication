import dotenv from "dotenv";
import express from "express";
import {ConnectDB }from './db/ConnectDB.js';
import authRoutes from "./routes/auth_routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT=process.env.PORT||5000;
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
console.log("cookie can be parsed");
app.use("/api/auth",authRoutes)
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
}



app.listen(PORT,()=>{
    ConnectDB();
    console.log("server running on the port ",PORT);

})
//