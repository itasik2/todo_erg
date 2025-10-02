// ЗАМЕНИТЕ НА ВАШ URL С RENDER.COM
const API_BASE = 'https://todo-erg-api.onrender.com';

// Простой обработчик ошибок
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

export const jsonServerAPI = {
  // === ЗАДАЧИ ===
  async createTask(taskData) {
    try {
      console.log('📤 Отправка заявки на сервер...', taskData);
      
      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...taskData,
          id: undefined, // JSON Server сам создаст ID
          createdAt: new Date().toISOString()
        }),
      });
      
      const result = await handleResponse(response);
      console.log('✅ Заявка создана:', result);
      return result;
    } catch (error) {
      console.error('❌ Ошибка создания заявки:', error);
      throw new Error('Не удалось создать заявку. Проверьте подключение к интернету.');
    }
  },

  async getTasks() {
    try {
      console.log('🔄 Загрузка заявок...');
      const response = await fetch(`${API_BASE}/tasks?_sort=createdAt&_order=desc`);
      const tasks = await handleResponse(response);
      console.log('✅ Загружено заявок:', tasks.length);
      return tasks;
    } catch (error) {
      console.error('❌ Ошибка загрузки заявок:', error);
      throw new Error('Не удалось загрузить заявки. Проверьте подключение к интернету.');
    }
  },

  async updateTask(id, updates) {
    try {
      console.log('🔄 Обновление заявки:', id, updates);
      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      const result = await handleResponse(response);
      console.log('✅ Заявка обновлена:', result);
      return result;
    } catch (error) {
      console.error('❌ Ошибка обновления заявки:', error);
      throw new Error('Не удалось обновить заявку.');
    }
  },

  async deleteTask(id) {
    try {
      console.log('🗑️ Удаление заявки:', id);
      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
      });
      
      await handleResponse(response);
      console.log('✅ Заявка удалена:', id);
      return { success: true };
    } catch (error) {
      console.error('❌ Ошибка удаления заявки:', error);
      throw new Error('Не удалось удалить заявку.');
    }
  },

  // === ИСПОЛНИТЕЛИ ===
  async getAssignees() {
    try {
      const response = await fetch(`${API_BASE}/assignees`);
      const assigneesData = await handleResponse(response);
      // Преобразуем в массив имен
      return assigneesData.map(item => item.name);
    } catch (error) {
      console.error('❌ Ошибка загрузки исполнителей:', error);
      // Fallback данные
      return ['Иванов Иван', 'Петров Петр'];
    }
  },

  async createAssignee(assigneeName) {
    try {
      const response = await fetch(`${API_BASE}/assignees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: assigneeName }),
      });
      
      await handleResponse(response);
      return assigneeName;
    } catch (error) {
      console.error('❌ Ошибка добавления исполнителя:', error);
      throw new Error('Не удалось добавить исполнителя.');
    }
  },

  async deleteAssignee(assigneeName) {
    try {
      // Сначала получаем всех исполнителей чтобы найти ID
      const response = await fetch(`${API_BASE}/assignees`);
      const assignees = await handleResponse(response);
      const assignee = assignees.find(a => a.name === assigneeName);
      
      if (assignee) {
        await fetch(`${API_BASE}/assignees/${assignee.id}`, {
          method: 'DELETE',
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Ошибка удаления исполнителя:', error);
      throw new Error('Не удалось удалить исполнителя.');
    }
  }
};