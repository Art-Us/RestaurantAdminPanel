import express from 'express'
import userAuth from '../middleware/userAuth.js';
import { createPromoCode, deletePromoCodeById, getAllPromoCodes, validatePromoCode } from '../controllers/promoController.js';

const promoRouter = express.Router();

promoRouter.get("/get-all-codes", userAuth, getAllPromoCodes);

promoRouter.post("/code-validation", validatePromoCode);
promoRouter.post("/create-code", userAuth, createPromoCode);
promoRouter.post("/delete-code-by-id", userAuth, deletePromoCodeById);


export default promoRouter;