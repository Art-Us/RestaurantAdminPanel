import express from 'express'
import userAuth from '../middleware/userAuth.js';
import { deleteUserById, getAllUsers, getUserData } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get("/data", userAuth, getUserData);
userRouter.get("/get-all-users", userAuth, getAllUsers);
userRouter.post("/delete-user-by-id", userAuth, deleteUserById);


export default userRouter;