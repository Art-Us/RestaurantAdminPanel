import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';

const DISHES_PATH = './menu_clean.json';
const IMAGES_PATH = './'; 

const importDishes = async () => {
  const data = JSON.parse(fs.readFileSync(DISHES_PATH, 'utf-8'));

  for (const dish of data) {
    const imagePath = path.join(IMAGES_PATH, dish.image);

    if (!fs.existsSync(imagePath)) {
      console.warn(`⚠️ Картинка не знайдена: ${dish.image}, пропускаємо...`);
      continue;
    }

    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

   
    form.append('name', dish.title);             
    form.append('description', dish.description);
    form.append('weight', dish.weight.toString());
    form.append('price', dish.price.toString());
    form.append('category', dish.type);         

    try {
      const res = await axios.post('http://localhost:4000/api/dish/add', form, {
        headers: form.getHeaders(),
      });

      console.log(`✅ Додано: ${dish.title}`);
    } catch (err) {
      console.error(`❌ Помилка при збереженні ${dish.title}:`, err.response?.data || err.message);
    }
  }
};

importDishes();
