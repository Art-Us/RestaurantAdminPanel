import express from "express";
import { addDish, getAllDishes, findDishById, getPublicDishes, deleteDish, updateDish, updateDishText  } from "../controllers/dishController.js";
import multer from "multer";

const dishRouter = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
});

const upload = multer({ storage: storage })

dishRouter.get("/dishes", getAllDishes );
dishRouter.get("/find/:id", findDishById)
dishRouter.post("/add", upload.single("image"), addDish)
dishRouter.delete("/delete/:id", deleteDish)
dishRouter.put("/update/:id", upload.single("image"), updateDish);
dishRouter.patch("/update-text/:id", updateDishText);
dishRouter.get('/dishes/public', getPublicDishes);

// dishRouter.delete("/delete/:id", deleteDish);
// dishRouter.get("/getAllDishes", getAllDishes)
// dishRouter.put("/update/:id", upload.single("image"), updateDish);



export default dishRouter;