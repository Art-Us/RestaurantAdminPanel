import dishModel from "../models/DishModel.js";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const addDish = async (req, res) => {
  let imageFilename;
  let imagePath;

  try {
    imageFilename = req.file?.filename;
    imagePath = imageFilename && path.join("uploads", imageFilename);

    const tempImagePath = imagePath + "_tmp.jpg";

    await sharp(imagePath)
    .resize({ width: 300 })
    .toFile(tempImagePath);

    await fs.promises.rename(tempImagePath, imagePath);


    const dish = new dishModel({
      name: req.body.name,
      description: req.body.description,
      weight: req.body.weight,
      price: req.body.price,
      category: req.body.category,
      image: imageFilename,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      priority: req.body.priority !== undefined ? Number(req.body.priority) : 0, 
    });

    await dish.save();

    res.status(201).json({
      success: true,
      message: "Блюдо успішно додано",
      addedDish: dish
    });

  } catch (error) {
    if (imagePath) {
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Не вдалося видалити файл після помилки:", err);
        } else {
          console.log(`Файл ${imageFilename} видалено через помилку в БД`);
        }
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Помилка при додаванні страви",
      error: error.message
    });
  }
}

const getAllDishes = async(req, res) => {
    try{
        const allDishes = await dishModel.find({}); // Fetch all dishes from the database because no filter is applied inside find()
        res.status(200).json({
            success: true,
            list_of_dishes: allDishes
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            "message": error.message,
        })
    }
}


const deleteDish = async(req, res) => {
    try {
        // const { id } = req.params;
        // OR
        const id = req.params.id;

        const dish = await dishModel.findByIdAndDelete(id);
        if (!dish) {
            res.status(404).json({
                success: false,
                message: "Блюдо не знайдено"
            });
        }
        // Delete the image file from the server
        if (dish.image) { // Check if the dish has an image
            const imagePath = path.join("uploads", dish.image);
            fs.unlink(imagePath, (err) => { // fs.unlink to delete the file
                if (err) {
                    console.error("Не вдалося видалити файл:", err);
                } else {
                    console.log(`Файл ${dish.image} успішно видалено`);
                }
            });
        }

        // await dishModel.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Блюдо успішно видалено"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Помилка при видаленні страви",
            error: error.message
        });
    }
}


const updateDish = async (req, res) => {
  const id = req.params.id;
  const { name, description, weight, price, category, isActive, priority } = req.body;
  const newImage = req.file?.filename;

  try {
    const dish = await dishModel.findById(id);
    if (!dish) {
      return res.status(404).json({
        success: false,
        message: "Блюдо не знайдено",
      });
    }

    // якщо нове зображення передано
    if (newImage) {
      const newImagePath = path.join("uploads", newImage);
      const tempPath = newImagePath + "_tmp.jpg";

      await sharp(newImagePath)
        .resize({ width: 300 })
        .toFile(tempPath);

      await fs.promises.rename(tempPath, newImagePath);

      // видаляє старе зображення якщо воно було
      if (dish.image) {
        const oldImagePath = path.join("uploads", dish.image);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error("Не вдалося видалити старий файл:", err);
          } else {
            console.log(`Старий файл ${dish.image} успішно видалено`);
          }
        });
      }

      dish.image = newImage; // оновлює тільки якщо нове зображення є
    }

    // оновлює текстові поля якщо передано
    dish.name = name ?? dish.name;
    dish.description = description ?? dish.description;
    dish.weight = weight ?? dish.weight;
    dish.price = price ?? dish.price;
    dish.category = category ?? dish.category;
    dish.isActive = isActive !== undefined ? isActive : dish.isActive;
    dish.priority    = priority    !== undefined ? Number(priority) : dish.priority;

    await dish.save();

    res.status(200).json({
      success: true,
      message: "Блюдо успішно оновлено",
      updatedDish: dish,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Помилка при оновленні страви",
      error: error.message,
    });
  }
};

const updateDishText = async (req, res) => { 
  const { id } = req.params;
  const { name, description, weight, price, category, isActive, priority } = req.body;

  try {
    const updated = await dishModel.findByIdAndUpdate(
      id,
      { name, description, weight, price, category, isActive,
        priority: priority !== undefined ? Number(priority) : 0,
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Блюдо не знайдено" });
    }

    res.json({ success: true, message: "Текст успішно оновлено", updatedDish: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Помилка при оновленні тексту", error: err.message });
  }
};


const findDishById = async (req, res) => {
    const id = req.params.id;
    try{
        const dishById = await dishModel.findById(id);
        if (!dishById){
            console.log("Блюдо не знайдено");
            res.status(404).json({
                success: false,
                message: "Блюдо не знайдено"
            });
        }
        res.status(200).json({
            success: true,
            dish: dishById
        });
    } catch(err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Помилка при отриманні страви за ID",
            error: err.message
        })
    }
}



const getPublicDishes = async (req, res) => {
  try {
    const dishes = await dishModel
      .find({ isActive: true })
      .sort({ category: 1, priority: -1, name: 1 });
    res.status(200).json({ success: true, list_of_dishes: dishes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export { addDish, getAllDishes, deleteDish, updateDishText, updateDish, findDishById, getPublicDishes };