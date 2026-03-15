import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface BackupTask {
  name: string;
  source: string;
  destination: string;
}

/**
 * Хук для управления задачами (загрузка, сохранение, добавление, удаление)
 * с гарантированной синхронизацией с базой.
 */

export const useBackupTasks = () => {
  const [tasks, setTasks] = useState<BackupTask[]>([]);

  const [name, setName] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  const [status, setStatus] = useState<string[]>([]);

  // Загрузка задач при инициализации
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const loadedTasks: BackupTask[] = await invoke("load_tasks", {});
        setTasks(loadedTasks);
      } catch (error) {
        console.error("Не удалось загрузить задачи:", error);
        setStatus((prev) => [...prev, `Ошибка загрузки задач: ${error}`]);
      }
    };

    loadTasks();
  }, []);

  // Универсальная синхронизация с БД
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

    const newTask: BackupTask = { name, source, destination };
    const updatedTasks = [...tasks, newTask];
    await syncTasks(updatedTasks);

    setStatus((prev) => [...prev, `Задача '${name}' успешно добавлена`]);
    setName("");
    setSource("");
    setDestination("");
  };

  const handleDeleteTask = async (index: number) => {
    const taskName = tasks[index].name;
    const updatedTasks = tasks.filter((_, i) => i !== index);
    await syncTasks(updatedTasks);
    setStatus((prev) => [...prev, `Задача '${taskName}' удалена`]);
  };

  const handleDeleteAllTasks = async () => {
    await syncTasks([]);
    setStatus((prev) => [...prev, "Все задачи удалены"]);
  };

  return {
    tasks,
    name,
    source,
    destination,
    setName,
    setSource,
    setDestination,
    handleAddTask,
    handleDeleteTask,
    handleDeleteAllTasks,
    status,
    setStatus,
  };
};
