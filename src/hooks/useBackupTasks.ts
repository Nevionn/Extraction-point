import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface BackupTask {
  name: string;
  source: string;
  destination: string;
  sortOrder: number;
}

export type BackupTaskForm = Omit<BackupTask, "sortOrder">;

/**
 * Хук для управления задачами для компонента (загрузка, сохранение, добавление, редактирование, удаление)
 * с синхронизацией с базой.
 */

export const useBackupTasks = () => {
  const [tasks, setTasks] = useState<BackupTask[]>([]);

  const [name, setName] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  const [status, setStatus] = useState<string[]>([]);

  // Загрузка задач при инициализации
  const loadTasks = async () => {
    try {
      const loadedTasks: BackupTask[] = await invoke("load_tasks", {});

      const sortedTasks = loadedTasks.sort((a, b) => a.sortOrder - b.sortOrder);

      setTasks(sortedTasks);
      return sortedTasks;
    } catch (error) {
      console.error("Не удалось загрузить задачи:", error);
      setStatus((prev) => [...prev, `Ошибка загрузки задач: ${error}`]);
      return [];
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const syncTasks = async (tasksToSave?: BackupTask[]) => {
    try {
      if (tasksToSave) {
        await invoke("save_tasks", { tasks: tasksToSave });
      }
      const loadedTasks: BackupTask[] = await invoke("load_tasks", {});
      setTasks(loadedTasks);
      return loadedTasks;
    } catch (error) {
      console.error("Ошибка синхронизации задач:", error);
      setStatus((prev) => [...prev, `Ошибка синхронизации: ${error}`]);
      return tasks; // fallback на текущее состояние
    }
  };

  // Добавление задачи в локальное состояние с запросом на синхранизацию
  const handleAddTask = async () => {
    if (!name || !source || !destination) {
      setStatus((prev) => [...prev, "Ошибка: Заполните все поля задачи"]);
      return;
    }

    // вычисляем следующий sortOrder
    const nextSortOrder =
      tasks.length > 0 ? Math.max(...tasks.map((t) => t.sortOrder)) + 1 : 0;

    const newTask: BackupTask = {
      name,
      source,
      destination,
      sortOrder: nextSortOrder,
    };

    const updatedTasks = [...tasks, newTask];

    await syncTasks(updatedTasks);

    setStatus((prev) => [...prev, `Задача '${name}' успешно добавлена`]);

    setName("");
    setSource("");
    setDestination("");
  };

  const handleUpdateTask = async (index: number, updatedTask: BackupTask) => {
    const updatedTasks = tasks.map((t, i) => (i === index ? updatedTask : t));

    await syncTasks(updatedTasks);
  };

  const handleDeleteTask = async (index: number) => {
    const taskName = tasks[index].name;

    const updatedTasks = tasks
      .filter((_, i) => i !== index)
      .map((task, i) => ({
        ...task,
        sortOrder: i,
      }));

    await syncTasks(updatedTasks);

    setStatus((prev) => [...prev, `Задача '${taskName}' удалена`]);
  };

  const handleDeleteAllTasks = async () => {
    await syncTasks([]);
    setStatus((prev) => [...prev, "Все задачи удалены"]);
  };

  return {
    tasks,
    setTasks,
    name,
    source,
    destination,
    setName,
    setSource,
    setDestination,
    handleAddTask,
    handleUpdateTask,
    handleDeleteTask,
    handleDeleteAllTasks,
    status,
    setStatus,
  };
};
