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

  const saveTasks = async (newTasks: BackupTask[]) => {
    try {
      await invoke("save_tasks", { tasks: newTasks });
    } catch (error) {
      console.error("Ошибка при сохранении задач:", error);
      setStatus((prev) => [...prev, `Ошибка сохранения задач: ${error}`]);
    }
  };

  const handleAddTask = () => {
    if (name && source && destination) {
      const newTasks = [...tasks, { name, source, destination }];
      setTasks(newTasks);
      setName("");
      setSource("");
      setDestination("");
      saveTasks(newTasks);
    } else {
      setStatus((prev) => [...prev, "Ошибка: Заполните все поля задачи"]);
    }
  };

  const handleDeleteTask = (index: number) => {
    const taskName = tasks[index].name;
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
    setStatus((prev) => prev.filter((_, i) => i !== index));
    saveTasks(newTasks);
    return taskName; // Возвращаем имя задачи для удаления прогресса
  };

  const handleDeleteAllTasks = () => {
    setTasks([]);
    setStatus([]);
    saveTasks([]);
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
