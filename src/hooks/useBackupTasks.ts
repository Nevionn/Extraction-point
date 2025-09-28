import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface BackupTask {
  name: string;
  source: string;
  destination: string;
}

/**
 * Хук для управления задачами (сохранение, загрузка, добавление, удаление).
 */

export const useBackupTasks = () => {
  const [tasks, setTasks] = useState<BackupTask[]>([]);
  const [name, setName] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState<string[]>([]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const loadedTasks: BackupTask[] = await invoke("load_tasks", {});
        setTasks(loadedTasks);
      } catch (error) {
        console.log("Не удалось загрузить задачи:", error);
        setStatus((prev) => [...prev, `Ошибка загрузки задач: ${error}`]);
      }
    };

    loadTasks();
  }, []);

  const saveTasks = async (newTask: BackupTask) => {
    try {
      await invoke("save_tasks", { tasks: [newTask] });
      // Синхронизация с базой после успешного сохранения
      const loadedTasks: BackupTask[] = await invoke("load_tasks", {});
      setTasks(loadedTasks);
    } catch (error) {
      throw error;
    }
  };

  const handleAddTask = async () => {
    if (!name || !source || !destination) {
      setStatus((prev) => [...prev, "Ошибка: Заполните все поля задачи"]);
      return;
    }

    const newTask: BackupTask = { name, source, destination };
    try {
      await saveTasks(newTask);
      setStatus((prev) => [...prev, `Задача '${name}' успешно добавлена`]);
      setName("");
      setSource("");
      setDestination("");
    } catch (error) {
      console.error("Ошибка добавления задачи:", error);
      setStatus((prev) => [...prev, `Задача '${name}' не добавлена: ${error}`]);
    }
  };

  const handleDeleteTask = (index: number) => {
    const taskName = tasks[index].name;
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
    setStatus((prev) => prev.filter((_, i) => i !== index));
    saveTasks(newTasks[0] || { name: "", source: "", destination: "" });
    return taskName; // Возвращаем имя задачи для удаления прогресса
  };

  const handleDeleteAllTasks = () => {
    setTasks([]);
    setStatus([]);
    saveTasks({ name: "", source: "", destination: "" });
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
