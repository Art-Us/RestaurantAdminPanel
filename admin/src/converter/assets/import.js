// import.js
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';

const DISHES_PATH = './menu_clean.json';
const IMAGES_PATH = './';

const uploadImage = async (filename) => {
  const form = new FormData();
  form.append('image', fs.createReadStream(path.join(IMAGES_PATH, filename)));

  try {
    const res = await axios.post('http://localhost:4000/api/upload', form, {
      headers: form.getHeaders(),
    });
    return res.data.filename; // або як твій бекенд відповідає
  } catch (err) {
    console.error('Помилка при завантаженні картинки:', filename, err.message);
    return null;
  }
};

const importDishes = async () => {
  const data = JSON.parse(fs.readFileSync(DISHES_PATH, 'utf-8'));

  for (const dish of data) {
    console.log(`Обробка: ${dish.name}`);

    const uploadedImage = await uploadImage(dish.image);
    if (!uploadedImage) {
      console.log(`Пропущено: ${dish.name}`);
      continue;
    }

    const payload = {
      ...dish,
      image: uploadedImage,
    };

    try {
      await axios.post('http://localhost:4000/api/dish/add', payload);
      console.log(`✅ Додано: ${dish.name}`);
    } catch (err) {
      console.error(`❌ Помилка при збереженні ${dish.name}:`, err.message);
    }
  }
};

importDishes();
