import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToExcel = (tasks, filename = 'заявки') => {
  const data = tasks.map(task => ({
    'Дата подачи': formatDate(task.createdAt),
    'Бригадир': task.foreman,
    'Лаборатория': task.lab,
    'Кабинет': task.roomNumber,
    'Описание': task.description,
    'Статус': task.status,
    'Приоритет': getPriorityLabel(task.priority),
    'Исполнитель': task.assignee || 'Не назначен',
    'Время работы': task.timeSpent || '-',
    'Дата принятия': formatDate(task.acceptedAt),
    'Дата выполнения': formatDate(task.completedAt)
  }));

  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Заявки');

  // Авто-ширина колонок
  const colWidths = [
    { wch: 15 }, { wch: 20 }, { wch: 15 }, 
    { wch: 10 }, { wch: 30 }, { wch: 12 },
    { wch: 10 }, { wch: 15 }, { wch: 12 },
    { wch: 15 }, { wch: 15 }
  ];
  worksheet['!cols'] = colWidths;

  writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportToPDF = (tasks, filename = 'заявки') => {
  const doc = new jsPDF();

  // Заголовок
  doc.setFontSize(16);
  doc.text('Отчет по заявкам', 14, 15);
  doc.setFontSize(10);
  doc.text(`Сгенерировано: ${new Date().toLocaleString('ru-RU')}`, 14, 22);

  // Данные таблицы
  const tableData = tasks.map(task => [
    formatDate(task.createdAt),
    task.foreman,
    task.lab,
    task.roomNumber,
    task.description.substring(0, 50) + (task.description.length > 50 ? '...' : ''),
    task.status,
    getPriorityLabel(task.priority),
    task.assignee || 'Не назначен',
    task.timeSpent || '-'
  ]);

  doc.autoTable({
    startY: 30,
    head: [[
      'Дата подачи', 'Бригадир', 'Лаборатория', 'Кабинет', 
      'Описание', 'Статус', 'Приоритет', 'Исполнитель', 'Время работы'
    ]],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [102, 126, 234] }
  });

  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToCSV = (tasks, filename = 'заявки') => {
  const headers = [
    'Дата подачи', 'Бригадир', 'Лаборатория', 'Кабинет', 'Описание',
    'Статус', 'Приоритет', 'Исполнитель', 'Время работы'
  ].join(',');

  const rows = tasks.map(task => [
    formatDate(task.createdAt),
    `"${task.foreman}"`,
    `"${task.lab}"`,
    task.roomNumber,
    `"${task.description.replace(/"/g, '""')}"`,
    task.status,
    getPriorityLabel(task.priority),
    `"${task.assignee || 'Не назначен'}"`,
    task.timeSpent || '-'
  ].join(','));

  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('ru-RU');
};

const getPriorityLabel = (priority) => {
  const labels = {
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий'
  };
  return labels[priority] || priority;
};