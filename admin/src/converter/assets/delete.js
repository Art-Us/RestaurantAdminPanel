import axios from 'axios';

const BASE_URL = 'http://localhost:4000';

const clearDishes = async () => {
  try {
    // Крок 1: Отримуємо всі страви
    const res = await axios.get(`${BASE_URL}/api/dish/dishes`);
    const dishes = res.data.list_of_dishes || [];

    if (dishes.length === 0) {
      console.log('ℹ️  База вже порожня.');
      return;
    }

    // Крок 2: Видаляємо кожну страву по ID
    for (const dish of dishes) {
      try {
        await axios.delete(`${BASE_URL}/api/dish/delete/${dish._id}`);
        console.log(`✅ Видалено: ${dish.name || dish.title || dish._id}`);
      } catch (err) {
        console.error(`❌ Помилка при видаленні ID ${dish._id}:`, err.response?.data || err.message);
      }
    }

    console.log(`🎉 Всі страви видалено (${dishes.length})`);
  } catch (err) {
    console.error('❌ Не вдалося отримати список страв:', err.response?.data || err.message);
  }
};

clearDishes();
