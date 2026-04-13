const form = document.querySelector('#schedule-form');
const dateInput = document.querySelector('#date');
const taskInput = document.querySelector('#task');
const list = document.querySelector('#schedule-list');
const emptyText = document.querySelector('#empty-text');
const clearAllButton = document.querySelector('#clear-all');

const STORAGE_KEY = 'simple-scheduler-items';

let schedules = loadSchedules();
renderSchedules();

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const date = dateInput.value;
  const task = taskInput.value.trim();

  if (!date || !task) {
    return;
  }

  schedules.push({
    id: crypto.randomUUID(),
    date,
    task,
  });

  schedules.sort((a, b) => a.date.localeCompare(b.date));
  saveSchedules();
  renderSchedules();

  taskInput.value = '';
  taskInput.focus();
});

clearAllButton.addEventListener('click', () => {
  if (!schedules.length) {
    return;
  }

  const confirmed = window.confirm('모든 일정을 삭제할까요?');
  if (!confirmed) {
    return;
  }

  schedules = [];
  saveSchedules();
  renderSchedules();
});

list.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const id = target.dataset.id;
  if (!id) {
    return;
  }

  schedules = schedules.filter((item) => item.id !== id);
  saveSchedules();
  renderSchedules();
});

function renderSchedules() {
  list.innerHTML = '';

  if (!schedules.length) {
    emptyText.hidden = false;
    return;
  }

  emptyText.hidden = true;

  for (const schedule of schedules) {
    const item = document.createElement('li');
    item.className = 'schedule-item';

    const content = document.createElement('div');

    const date = document.createElement('div');
    date.className = 'date';
    date.textContent = formatDate(schedule.date);

    const task = document.createElement('div');
    task.className = 'task';
    task.textContent = schedule.task;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-btn';
    deleteButton.type = 'button';
    deleteButton.textContent = '삭제';
    deleteButton.dataset.id = schedule.id;

    content.append(date, task);
    item.append(content, deleteButton);
    list.append(item);
  }
}

function loadSchedules() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item) =>
        typeof item.id === 'string' &&
        typeof item.date === 'string' &&
        typeof item.task === 'string'
    );
  } catch {
    return [];
  }
}

function saveSchedules() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
}

function formatDate(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateText;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
}
