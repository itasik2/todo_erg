import React, { useState, useEffect, useCallback, useMemo } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import { jsonServerAPI } from "./services/api/json-server-api";
import { useNotifications } from "./hooks/useNotifications";
import LoginForm from "./components/common/LoginForm";
import Header from "./components/common/Header";
import TaskTable from "./components/tasks/TaskTable";
import TaskModal from "./components/tasks/TaskModal";
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
  const [serverStatus, setServerStatus] = useState('checking');

  // Хуки
  const { 
    notifications, 
    showNotification, 
    removeNotification, 
    audioRef
  } = useNotifications();

  const { theme, toggleTheme } = useTheme();

  // Загрузка данных
  const loadData = useCallback(async () => {
    try {
      console.log('🚀 Загрузка данных с вашего сервера...');
      
      const [tasksData, assigneesData] = await Promise.all([
        jsonServerAPI.getTasks(),
        jsonServerAPI.getAssignees(),
      ]);

      // Сортируем задачи по дате создания (новые сверху)
      const sortedTasks = tasksData.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setTasks(sortedTasks);
      setAssignees(assigneesData);
      
      console.log('✅ Данные успешно загружены!', {
        tasks: sortedTasks.length,
        assignees: assigneesData.length
      });
      
    } catch (error) {
      console.error("❌ Ошибка загрузки данных:", error);
      showNotification("Ошибка подключения к серверу", "error");
    }
  }, [showNotification]);

  // Проверка сервера при загрузке
  useEffect(() => {
    const checkServer = async () => {
      try {
        await jsonServerAPI.getTasks();
        setServerStatus('online');
      } catch {
        setServerStatus('offline');
      }
    };

    checkServer();
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
        console.error("Ошибка при загрузке пользователя:", e);
        localStorage.removeItem("currentUser");
      }
    }
    loadData();
  }, [loadData]);

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
  const {
    currentPage,
    currentItems,
    totalPages,
    goToPage,
    setItemsPerPage: setPaginationItemsPerPage
  } = usePagination(searchResults, itemsPerPage);

  // Обработчики
  const handleFilterChange = useCallback((filter, value) => {
    setSearchFilters((prev) => ({ ...prev, [filter]: value }));
  }, [setSearchFilters]);

  const handlePageChange = useCallback((page, newItemsPerPage = itemsPerPage) => {
    if (newItemsPerPage !== itemsPerPage) {
      setItemsPerPage(newItemsPerPage);
      setPaginationItemsPerPage(newItemsPerPage);
    }
    goToPage(page);
  }, [itemsPerPage, goToPage, setPaginationItemsPerPage]);

  // Авторизация
  const handleLogin = useCallback((userData, isAdmin = false) => {
    const user = { 
      ...userData, 
      isAdmin, 
      id: Date.now().toString(),
      displayName: `${userData.firstName} ${userData.lastName || ''}`.trim()
    };
    
    setCurrentUser(user);
    setIsAuthenticated(true);
    setAdminMode(isAdmin);
    localStorage.setItem("currentUser", JSON.stringify(user));

    const welcomeMessage = isAdmin 
      ? `Добро пожаловать, администратор ${userData.firstName}!` 
      : `Добро пожаловать, ${userData.firstName}!`;
      
    showNotification(welcomeMessage);
  }, [showNotification]);

  const handleAdminLogin = useCallback((adminData) => {
    handleLogin(adminData, true);
  }, [handleLogin]);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAdminMode(false);
    localStorage.removeItem("currentUser");
    showNotification("Вы вышли из системы");
  }, [showNotification]);

  // Работа с задачами
  const addTaskFromModal = useCallback(async (formData) => {
    const requiredFields = ["foreman", "lab", "roomNumber", "description"];
    const missingFields = requiredFields.filter(field => !formData[field]?.trim());

    if (missingFields.length > 0) {
      throw new Error("Заполните все обязательные поля");
    }

    try {
      const taskData = {
        foreman: formData.foreman.trim(),
        lab: formData.lab.trim(),
        roomNumber: formData.roomNumber.trim(),
        description: formData.description.trim(),
        assignee: formData.assignee || null,
        priority: formData.priority,
        status: "новая",
        acceptedAt: null,
        completedAt: null,
        timeSpent: null,
        author: currentUser ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : "Неизвестный пользователь",
        createdAt: new Date().toISOString()
      };

      console.log('📝 Отправка данных на сервер...', taskData);
      
      const newTask = await jsonServerAPI.createTask(taskData);
      
      // Добавляем новую задачу в состояние
      setTasks(prev => [newTask, ...prev]);
      
      showNotification("✅ Заявка успешно создана!");
      return true;
    } catch (error) {
      console.error('❌ Ошибка при создании заявки:', error);
      showNotification(error.message || "Ошибка при создании заявки", "error");
      throw error;
    }
  }, [currentUser, showNotification]);

  const updateTask = useCallback(async (id, updates) => {
    try {
      const updatedTask = await jsonServerAPI.updateTask(id, updates);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      return updatedTask;
    } catch (error) {
      console.error("❌ Ошибка при обновлении заявки:", error);
      throw error;
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    try {
      await jsonServerAPI.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
      showNotification("✅ Заявка удалена");
    } catch (error) {
      showNotification("❌ Ошибка при удалении заявки", "error");
    }
  }, [showNotification]);

  // Работа с исполнителями
  const addAssignee = useCallback(async (assigneeName) => {
    if (!assigneeName.trim()) {
      showNotification("Введите имя исполнителя", "error");
      return;
    }

    try {
      await jsonServerAPI.createAssignee(assigneeName);
      // Обновляем список исполнителей
      const updatedAssignees = await jsonServerAPI.getAssignees();
      setAssignees(updatedAssignees);
      showNotification("✅ Исполнитель добавлен");
    } catch (error) {
      showNotification("❌ Ошибка при добавлении исполнителя", "error");
    }
  }, [showNotification]);

  const removeAssignee = useCallback(async (assignee) => {
    try {
      await jsonServerAPI.deleteAssignee(assignee);
      // Обновляем список исполнителей
      const updatedAssignees = await jsonServerAPI.getAssignees();
      setAssignees(updatedAssignees);
      showNotification("✅ Исполнитель удалён");
    } catch (error) {
      showNotification("❌ Ошибка при удалении исполнителя", "error");
    }
  }, [showNotification]);

  // Обработка изменения статуса задачи
  const handleStatusChange = useCallback(async (taskId, newStatus, currentStatus) => {
    if (currentStatus === "выполнено" && !adminMode) {
      showNotification("Только администратор может изменять выполненные задачи", "error");
      return;
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
      if (newStatus === "в работе") {
        updates.acceptedAt = new Date().toISOString();
      }
      await updateTask(taskId, updates);
    }
  }, [adminMode, showNotification, updateTask]);

  // Сохранение времени выполнения
  const saveTimeSpent = useCallback(async () => {
    if (timeModal.hours < 0 || timeModal.minutes < 0 || timeModal.minutes >= 60) {
      setTimeModal((prev) => ({
        ...prev,
        error: "Введите корректное время (часы ≥ 0, 0 ≤ минуты < 60)",
      }));
      return;
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
  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "выполнено").length,
    inProgress: tasks.filter((t) => t.status === "в работе").length,
    new: tasks.filter((t) => t.status === "новая").length,
  }), [tasks]);

  // Форматирование даты
  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "-" : date.toLocaleString("ru-RU", {
        day: "2-digit", month: "2-digit", year: "numeric", 
        hour: "2-digit", minute: "2-digit"
      });
    } catch {
      return "-";
    }
  }, []);

  // Условный рендеринг
  if (!isAuthenticated) {
    return (
      <div className="app" data-theme={theme}>
        <LoginForm onLogin={handleLogin} onAdminLogin={handleAdminLogin} />
      </div>
    );
  }

  return (
    <Router>
      <div className="app" data-theme={theme}>
        <audio ref={audioRef} preload="auto" />

        {/* Статус подключения */}
        <div className={`connection-status ${serverStatus === 'online' ? 'online' : 'offline'}`}>
          {serverStatus === 'online' ? '🌐 Сервер онлайн' : '🔴 Сервер офлайн'}
          <br />
          <small>https://todo-erg-api.onrender.com</small>
        </div>

        <Header 
          user={currentUser} 
          onLogout={handleLogout} 
          stats={stats}  
          extraControls={<ThemeToggle theme={theme} onToggle={toggleTheme} />} 
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
            {hasActiveSearch && (
              <span className="search-info">
                Найдено: {searchResults.length} заявок
              </span>
            )}
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
            tasks={currentItems}
            assignees={assignees}
            adminMode={adminMode}
            onStatusChange={handleStatusChange}
            onDelete={deleteTask}
            formatDateTime={formatDateTime}
            onAssigneeChange={async (taskId, assignee) => {
              await updateTask(taskId, { assignee: assignee || null });
            }}
            onTimeSpentChange={async (taskId, timeSpent) => {
              await updateTask(taskId, { 
                timeSpent,
                status: "выполнено",
                completedAt: new Date().toISOString() 
              });
            }}
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={searchResults.length}
              itemsPerPage={itemsPerPage}
            />
          )}

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
    </Router>
  );
}

export default App;
