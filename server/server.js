import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";

import http from 'http';

import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import promoRouter from "./routes/promoRoutes.js";
import feedbackRouter from "./routes/feedbackRoutes.js";
import orderRouter from "./routes/orderRoutes.js";

import dishRouter from "./routes/dishRoute.js";

const app = express();
const port = process.env.PORT || 4000;
connectDB();



const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174']

app.use(express.json())
app.use(cookieParser())
// app.use(cors({credentials: true}))
app.use(cors({origin: allowedOrigins, credentials: true}))





app.get('/', (req, res)=> res.send("Api Working"))
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/promo", promoRouter)
app.use("/api/feedback", feedbackRouter)
app.use("/api/order", orderRouter)

app.use("/api/dish", dishRouter)
app.use("/images", express.static("uploads"))

const server = http.createServer(app); // Создаем http сервер

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('The admin connected via WebSocket');
});

server.listen(port, () => console.log(`Server started on PORT: ${port}`));

export { io };