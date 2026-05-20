import express from 'express'
import userAuth from '../middleware/userAuth.js';
import { completeOrderById, createOrder, getTodayOrders } from '../controllers/orderController.js';


const orderRouter = express.Router();

orderRouter.post("/create", createOrder);
orderRouter.get("/get-today-orders", userAuth, getTodayOrders);
orderRouter.post("/complete-by-id", userAuth, completeOrderById);


export default orderRouter;