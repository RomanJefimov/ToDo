// Модуль для работы с localStorage
// Содержит функции загрузки/сохранения списка задач и генерации id

import type { Task } from './types';

const STORAGE_KEY = 'kanban_tasks_v1';

// Безопасная загрузка задач из LocalStorage.
// Если завписей нет или формат поврежден - вернем пустой массив
export function loadTasks(): Task[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        // Простейшая валидация структуры
        return parsed.filter((t) => 
        t && typeof t === 'object' &&
        typeof (t as any).id === 'string' &&
        typeof (t as any).title === 'string' &&
        typeof (t as any).createdAt === 'string' &&
        (['todo', 'wip', 'done', 'testing'] as const).includes((t as any).status)      
        ) as Task [];
    } catch {
        return [];
    }
}

// Сохранение массива задач как JSON-строки
export function saveTasks(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Простейшая генерация уникального идентификатора
// Используем время + случайный суффикс
export function generateId(): string {
    const rnd = Math.random().toString(36).slice(2, 8);
    return `${Date.now().toString(36)}_${rnd}`;
}