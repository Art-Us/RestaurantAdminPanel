import express from 'express'
import userAuth from '../middleware/userAuth.js';
import { applyFeedBackById, createFeedBack, deleteFeedBackById, getAllFeedBacks } from '../controllers/feedbackController.js';



const feedbackRouter = express.Router();

feedbackRouter.post("/create", createFeedBack);
feedbackRouter.get("/get-all", userAuth, getAllFeedBacks);
feedbackRouter.post("/apply-by-id", userAuth, applyFeedBackById);
feedbackRouter.post("/delete-by-id", userAuth, deleteFeedBackById);


export default feedbackRouter;