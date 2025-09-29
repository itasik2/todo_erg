import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./App.css";
import { mockAPI } from "./services/api/mock-api";
import { useNotifications } from "./hooks/useNotifications";
import LoginForm from "./components/common/LoginForm";
import Header from "./components/common/Header";
import TaskTable from "./components/tasks/TaskTable";
import TaskModal from "./components/tasks/TaskModal";
import Notification from "./components/common/Notification";
import TimeInputModal from "./components/tasks/TimeInputModal";
import AssigneeManagement from "./components/admin/AssigneeManagement";
import { usePagination } from "./hooks/usePagination";
import { useSearch } from "./hooks/useSearch";
import { useTheme } from "./hooks/useTheme";
import ThemeToggle from "./components/common/ThemeToggle";
import SearchPanel from "./components/search/SearchPanel";
import Pagination from "./components/common/Pagination";
import ExportButton from "./components/export/ExportButton";
import NotificationCenter from "./components/common/NotificationCenter";

// Убрали неиспользуемую константу
// const ADMIN_PASSWORD = "admin123";

function App() {
  // Состояния
  const [tasks, setTasks] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [adminMode, setAdminMode] = useState(false);
  const [timeModal, setTimeModal] = useState({
    show: false,
    taskId: null,
    hours: 0,
    minutes: 0,
    error: "",
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Хуки
  const { 
    notifications, 
    showNotification, 
    removeNotification, 
    audioRef,
    notification 
  } = useNotifications();

  const { theme } = useTheme();

  // Загрузка данных
  const loadData = useCallback(async () => {
    try {
      const [tasksData, assigneesData] = await Promise.all([
        mockAPI.getTasks(),
        mockAPI.getAssignees(),
      ]);

      setTasks(tasksData.tasks || tasksData);
      setAssignees(assigneesData.assignees || assigneesData);
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
      showNotification("Ошибка загрузки данных", "error");
    }
  }, [showNotification]);

  // Фильтрация задач
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesDate =
        !dateFilter ||
        new Date(task.createdAt).toLocaleDateString() ===
          new Date(dateFilter).toLocaleDateString();
      const matchesHideCompleted =
        !hideCompleted || task.status !== "выполнено";
      return matchesDate && matchesHideCompleted;
    });
  }, [tasks, dateFilter, hideCompleted]);

  // Поиск и фильтрация
  const searchableFields = [
    "foreman",
    "lab",
    "roomNumber",
    "description",
    "assignee",
  ];
  const {
    searchTerm,
    setSearchTerm,
    searchFilters,
    setSearchFilters,
    searchResults,
    clearSearch,
    hasActiveSearch,
  } = useSearch(filteredTasks, searchableFields);

  // Пагинация
  const pagination = usePagination(searchResults, itemsPerPage);

  // Обработчики
  const handleFilterChange = useCallback((filter, value) => {
    setSearchFilters((prev) => ({ ...prev, [filter]: value }));
  }, [setSearchFilters]); // Добавили недостающую зависимость

  const handlePageChange = useCallback((page, newItemsPerPage = itemsPerPage) => {
    if (newItemsPerPage !== itemsPerPage) {
      setItemsPerPage(newItemsPerPage);
    }
    pagination.goToPage(page);
  }, [itemsPerPage, pagination]);

  // Авторизация
  const handleLogin = useCallback(
    (userData, isAdmin = false) => {
      const user = { ...userData, isAdmin };
      setCurrentUser(user);
      setIsAuthenticated(true);
      setAdminMode(isAdmin);
      localStorage.setItem("currentUser", JSON.stringify(user));
      showNotification(`Добро пожаловать, ${userData.firstName}!`);
    },
    [showNotification],
  );

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAdminMode(false);
    localStorage.removeItem("currentUser");
    showNotification("Вы вышли из системы");
  }, [showNotification]);

  // Работа с задачами
  const addTaskFromModal = useCallback(
    async (formData) => {
      const requiredFields = ["foreman", "lab", "roomNumber", "description"];
      const missingFields = requiredFields.filter(
        (field) => !formData[field].trim(),
      );

      if (missingFields.length > 0) {
        throw new Error("Заполните все обязательные поля");
      }

      try {
        const taskData = {
          ...formData,
          createdAt: new Date().toISOString(),
          status: "новая",
          acceptedAt: null,
          completedAt: null,
          timeSpent: null,
          author: `${currentUser.firstName} ${currentUser.lastName}`,
        };

        const newTask = await mockAPI.createTask(taskData);
        setTasks((prev) => [...prev, newTask]);
        showNotification("Заявка создана!");
        return true;
      } catch (error) {
        showNotification(
          error.message || "Ошибка при создании заявки",
          "error",
        );
        throw error;
      }
    },
    [currentUser, showNotification],
  );

  const updateTask = useCallback(async (id, updates) => {
    try {
      const updatedTask = await mockAPI.updateTask(id, updates);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task)),
      );
      return updatedTask;
    } catch (error) {
      console.error("Ошибка при обновлении заявки:", error);
      throw error;
    }
  }, []);

  const deleteTask = useCallback(
    async (id) => {
      try {
        await mockAPI.deleteTask(id);
        setTasks((prev) => prev.filter((task) => task.id !== id));
        showNotification("Заявка удалена");
      } catch (error) {
        showNotification("Ошибка при удалении заявки", "error");
      }
    },
    [showNotification],
  );

  // Работа с исполнителями
  const addAssignee = useCallback(
    async (assigneeName) => {
      try {
        await mockAPI.createAssignee({ name: assigneeName });
        setAssignees((prev) => [...prev, assigneeName]);
        showNotification("Исполнитель добавлен");
      } catch (error) {
        showNotification("Ошибка при добавлении исполнителя", "error");
      }
    },
    [showNotification],
  );

  const removeAssignee = useCallback(
    async (assignee) => {
      try {
        await mockAPI.deleteAssignee(assignee);
        setAssignees((prev) => prev.filter((a) => a !== assignee));
        showNotification("Исполнитель удалён");
      } catch (error) {
        showNotification("Ошибка при удалении исполнителя", "error");
      }
    },
    [showNotification],
  );

  // Обработка изменения статуса задачи
  const handleStatusChange = useCallback(
    async (taskId, newStatus, currentStatus) => {
      if (currentStatus === "выполнено" && !adminMode) {
        return showNotification(
          "Только администратор может изменять выполненные задачи",
          "error",
        );
      }

      if (newStatus === "выполнено") {
        setTimeModal({
          show: true,
          taskId,
          hours: 0,
          minutes: 0,
          error: "",
        });
      } else {
        const updates = { status: newStatus };
        if (newStatus === "в работе")
          updates.acceptedAt = new Date().toISOString();
        await updateTask(taskId, updates);
      }
    },
    [adminMode, showNotification, updateTask],
  );

  // Сохранение времени выполнения
  const saveTimeSpent = useCallback(async () => {
    if (
      timeModal.hours < 0 ||
      timeModal.minutes < 0 ||
      timeModal.minutes >= 60
    ) {
      return setTimeModal((prev) => ({
        ...prev,
        error: "Введите корректное время (часы ≥ 0, 0 ≤ минуты < 60)",
      }));
    }

    const timeSpent = `${timeModal.hours}ч ${timeModal.minutes}м`;
    await updateTask(timeModal.taskId, {
      status: "выполнено",
      timeSpent,
      completedAt: new Date().toISOString(),
    });
    setTimeModal({
      show: false,
      taskId: null,
      hours: 0,
      minutes: 0,
      error: "",
    });
  }, [timeModal, updateTask]);

  // Статистика
  const stats = useMemo(
    () => ({
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "выполнено").length,
      inProgress: tasks.filter((t) => t.status === "в работе").length,
      new: tasks.filter((t) => t.status === "новая").length,
    }),
    [tasks],
  );

  // Форматирование даты
  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";

      return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "-";
    }
  }, []);

  // Загрузка данных при монтировании
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
        setAdminMode(user.isAdmin || false);
      } catch (e) {
        localStorage.removeItem("currentUser");
      }
    }
    loadData();
  }, [loadData]);

  // Условный рендеринг
  if (!isAuthenticated) {
    return (
      <div className="app">
        <LoginForm
          onLogin={handleLogin}
          onAdminLogin={(userData) => handleLogin(userData, true)}
        />
        <Notification {...notification} />
      </div>
    );
  }

  return (
    <div className="app" data-theme={theme}>
      <audio ref={audioRef} preload="auto" />

      <Header 
        user={currentUser} 
        onLogout={handleLogout} 
        stats={stats}  
        extraControls={<ThemeToggle />} 
      />

      <div className="main-content">
        {adminMode && (
          <AssigneeManagement
            assignees={assignees}    
            onAdd={addAssignee}
            onRemove={removeAssignee}
          />
        )}

        <SearchPanel
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchFilters={searchFilters}
          onFilterChange={handleFilterChange}
          onClearSearch={clearSearch}
          assignees={assignees}
          hasActiveSearch={hasActiveSearch}
        />

        <div className="toolbar">
          <ExportButton tasks={searchResults} />
          <span className="search-info">
            {hasActiveSearch && `Найдено: ${searchResults.length} заявок`}
          </span>
        </div>

        <div className="filters">
          <div className="date-filter">
            <label>Фильтр по дате:</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <button onClick={() => setDateFilter("")}>Сбросить</button>
          </div>
          <label className="hide-completed">
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={(e) => setHideCompleted(e.target.checked)}
            />
            Скрыть выполненные
          </label>
        </div>

        <TaskTable
          tasks={pagination.currentItems}
          assignees={assignees}
          adminMode={adminMode}
          onStatusChange={handleStatusChange}
          onDelete={deleteTask}
          formatDateTime={formatDateTime}
          onAssigneeChange={async (taskId, assignee) => {
            await updateTask(taskId, { assignee: assignee || null });
          }}
        />

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          totalItems={searchResults.length}
          itemsPerPage={itemsPerPage}
        />

        <button
          className="add-task-button"
          onClick={() => setShowTaskModal(true)}
        >
          ➕ Новая заявка
        </button>
      </div>

      <NotificationCenter
        notifications={notifications}
        onRemove={removeNotification}
      />

      <TaskModal
        show={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSubmit={addTaskFromModal}
        assignees={assignees}
      />

      <Notification {...notification} />

      <TimeInputModal
        show={timeModal.show}
        onClose={() => setTimeModal((prev) => ({ ...prev, show: false }))}
        hours={timeModal.hours}
        minutes={timeModal.minutes}
        error={timeModal.error}
        onHoursChange={(value) =>
          setTimeModal((prev) => ({
            ...prev,
            hours: Math.max(0, parseInt(value) || 0),
            error: "",
          }))
        }
        onMinutesChange={(value) =>
          setTimeModal((prev) => ({
            ...prev,
            minutes: Math.max(0, Math.min(59, parseInt(value) || 0)),
            error: "",
          }))
        }
        onSave={saveTimeSpent}
      />
    </div>
  );
}

export default App;