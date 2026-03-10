import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface BackupTask {
  /** Уникальный идентификатор задачи, нужен для DnD */
  id: string;
  name: string;
  source: string;
  destination: string;
}

/**
 * Хук для управления задачами бэкапа.
 * Обеспечивает:
 * - Загрузку задач из хранилища (Tauri invoke "load_tasks")
 * - Сохранение задач (Tauri invoke "save_tasks")
 * - Добавление, удаление одной или всех задач
 * - Обновление порядка задач после drag&drop
 * - Управление полями формы и статусами
 *
 * @returns объект с состояниями и функциями для работы с задачами
 */

export const useBackupTasks = () => {
  const [tasks, setTasks] = useState<BackupTask[]>([]);
  const [name, setName] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState<string[]>([]);

  /** Загружам задачи из бд */
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const loadedTasks: BackupTask[] = await invoke("load_tasks", {});
        setTasks(
          loadedTasks.map((t: BackupTask) => ({
            ...t,
            id: t.id || crypto.randomUUID(),
          })),
        );
      } catch (error) {
        setStatus((prev) => [...prev, `Ошибка загрузки задач: ${error}`]);
      }
    };
    loadTasks();
  }, []);

  /**
   * Сохраняем задачи в бд
   * @param tasksToSave массив задач для сохранения
   */

  const saveTasks = async (tasksToSave: BackupTask[]) => {
    try {
      await invoke("save_tasks", { tasks: tasksToSave });
      setTasks(tasksToSave);
    } catch (error) {
      throw error;
    }
  };

  /** Добавляем новую задачу */
  const handleAddTask = async () => {
    if (!name || !source || !destination) {
      setStatus((prev) => [...prev, "Ошибка: Заполните все поля задачи"]);
      return;
    }
    const newTask: BackupTask = {
      id: crypto.randomUUID(),
      name,
      source,
      destination,
    };
    await saveTasks([...tasks, newTask]);
    setStatus((prev) => [...prev, `Задача '${name}' успешно добавлена`]);
    setName("");
    setSource("");
    setDestination("");
  };

  /**
   * Удаляем задачу по индексу
   * @param index индекс задачи в массиве
   * @returns имя удалённой задачи
   */
  const handleDeleteTask = (index: number) => {
    const taskName = tasks[index].name;
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
    setStatus((prev) => [...prev, `Задача '${taskName}' удалена`]);
    saveTasks(newTasks);
    return taskName;
  };

  const handleDeleteAllTasks = () => {
    setTasks([]);
    setStatus((prev) => [...prev, "Все задачи удалены"]);
    saveTasks([]);
  };

  /**
   * Обновляем порядок задач после drag&drop
   * @param newTasks новый массив задач
   */

  const updateTasksOrder = (newTasks: BackupTask[]) => {
    setTasks(newTasks);
    saveTasks(newTasks);
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
    updateTasksOrder,
    status,
    setStatus,
  };
};
