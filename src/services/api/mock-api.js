// Временный мок API для разработки
class MockAPI {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    this.assignees = JSON.parse(localStorage.getItem("assignees")) || [
      "Иван Иванов",
      "Петр Петров",
    ];
    this.init();
  }

  init() {
    if (this.tasks.length === 0) {
      // Добавляем тестовые данные
      this.tasks = [
        {
          id: "1",
          foreman: "Сидоров А.А.",
          lab: "Химическая",
          roomNumber: "101",
          description: "Починить вытяжку",
          status: "новая",
          priority: "high",
          assignee: "Иван Иванов",
          createdAt: new Date().toISOString(),
          author: "Admin",
        },
      ];
      this.saveToStorage();
    }
  }

  saveToStorage() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
    localStorage.setItem("assignees", JSON.stringify(this.assignees));
  }

  // Tasks methods
  async getTasks() {
    await this.delay(200);
    return { tasks: this.tasks };
  }

  async createTask(taskData) {
    await this.delay(300);
    const newTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: "новая",
      acceptedAt: null,
      completedAt: null,
      timeSpent: null,
    };
    this.tasks.push(newTask);
    this.saveToStorage();
    return newTask;
  }

  async updateTask(taskId, updates) {
    await this.delay(300);
    const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) throw new Error("Task not found");

    this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
    this.saveToStorage();
    return this.tasks[taskIndex];
  }

  async deleteTask(taskId) {
    await this.delay(300);
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    this.saveToStorage();
  }

  // Assignees methods
  async getAssignees() {
    await this.delay(200);
    return { assignees: this.assignees };
  }

  async createAssignee(assigneeData) {
    await this.delay(300);
    this.assignees.push(assigneeData.name);
    this.saveToStorage();
    return { message: "Assignee created" };
  }

  async deleteAssignee(assigneeName) {
    await this.delay(300);
    this.assignees = this.assignees.filter((a) => a !== assigneeName);
    this.saveToStorage();
  }

  // Utility method for simulating network delay
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const mockAPI = new MockAPI();
