// Модуль, отвечавющий за взаимодействие с DOM
import type { Task, Status } from './types';

// Утилита форматирования даты для пользовательского вывода
export function formatDate(iso: string): string {
    //Преобразуем ISO-строку в удобочитаемую дату/время
    const d = new Date(iso);
    // toLocaleString - простой способ вывести дату с учетом локали
    return d.toLocaleString(undefined, {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}

//Создание DOM-элемента карточки задачи
export function createTaskElement(task: Task): HTMLElement {
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('role', 'listitem');
    // для DnD: указываем что элемент можно перетаскивать
    card.draggable = true;
    // Сохраняем id в data-атрибуте, чтобы легко извлечь при drop
    card.dataset.id = task.id;

    // Кнопка удаления карточки
    const delBtn = document.createElement('button');
    delBtn.className = 'card-delete';
    delBtn.type = 'button';
    delBtn.title = 'Delete task';
    delBtn.setAttribute('aria-label', 'Delete task');
    delBtn.textContent = 'x';

    //Заголовок задачи
    const titleEl = document.createElement('div');
    titleEl.className = 'card-title';
    titleEl.textContent = task.title;

    //Приоритет задачи
    const priorityEl = document.createElement('div');
    priorityEl.className = 'card-priority';
    priorityEl.textContent = task.priority;

    //Метаданные дата создание
    const metaEl = document.createElement('div');
    metaEl.className = 'card-meta';
    metaEl.textContent = `Created: ${formatDate(task.createdAt)}`;

    card.append(delBtn, titleEl, priorityEl, metaEl);
    return card;
}

// Привязка обработчиков Drag & Drop к колонкам и карточкам
// onMove - колбек, вызывается при переносе карточки в новую колонку
export function bindDragAndDrop(
    columns: Record<Status, HTMLElement>,
    onMove: (taskId: string, to: Status) => void
    ): void {
        //Навешиваем обработчики на каждую колонку
        (Object.keys(columns) as Status[]).forEach((status) => {
            const col = columns[status];

            //При перетаскивании над колонкой - разрешаем drop
            col.addEventListener('dragover', (e) => {
                e.preventDefault();
                col.classList.add('drag-over');
            });

            col.addEventListener('dragleave', () => {
                col.classList.remove('drag-over');
            });

            // При броске карточки: извлекаем id и оповещаем колбек
            col.addEventListener('drop', (e) => {
                e.preventDefault();
                col.classList.remove('drag-over');
                const id = e.dataTransfer?.getData('text/plain');
                if (id) onMove(id, status);
            });
        });

        //Делегируем обработчик dragstart на весь документ: карточки созда.тся динамически
        document.addEventListener('dragstart', (e) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;
            // Проверяем, что старт перетаскивания относится к карточке
            const card = target.closest('.card') as HTMLElement | null;
            if (card && card.dataset.id) {
                e.dataTransfer?.setData('text/plain', card.dataset.id);
                //Небольшой визуальный эффект: полупрозрачность в момент переноса
                card.style.opacity = '0.6';
            }
        });

        document.addEventListener('dragend', (e) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;
            const card = target.closest('.card') as HTMLElement | null;
            if (card) {
                card.style.opacity = '';
            }
        });
    }

// Рендер задач в соответствующие колонки
export function renderBoard(tasks: Task[], columns: Record<Status, HTMLElement>): void {
    //Сначала очищаем содержимое колонок
    (Object.keys(columns) as Status []).forEach((status) => {
        columns[status].innerHTML = '';
    });

    // Затем создаем и добавляем в нужную колонку
    tasks.forEach((task) => {
        const el = createTaskElement(task);
        columns[task.status].appendChild(el);
    });
}