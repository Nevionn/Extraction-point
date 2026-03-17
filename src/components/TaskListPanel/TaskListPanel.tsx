import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { BackupTask } from "../../hooks/useBackupTasks";
import styles from "./TaskListPanel.module.css";

import EditModal from "../modals/EditModal/EditModal";

import { HiRocketLaunch } from "react-icons/hi2";
import { MdDeleteForever } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import "../../App.css";

interface TaskListPanelProps {
  tasks: BackupTask[];
  setTasks: (tasks: BackupTask[]) => void;
  onDeleteTask: (index: number) => void;
  onDeleteAllTasks: () => void;
  onStartBackups: () => void;
  onStartSingleBackup: (index: number) => void;
  isBackingUp: boolean;
}

/**
 * Компонент для управления существующими задачами.
 * Можно удалить как отдельно взятую задачу, так и все разом.
 * Позволяет редактировать задачу.
 * Также запускает процесс бэкапа всех задач или отдельной задачи.
 *
 * @returns {JSX.Element}
 */

const TaskListPanel: React.FC<TaskListPanelProps> = ({
  tasks,
  setTasks,
  onDeleteTask,
  onDeleteAllTasks,
  onStartBackups,
  onStartSingleBackup,
  isBackingUp,
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleEditOpen = (index: number) => {
    setEditingIndex(index);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (updatedTask: BackupTask) => {
    if (editingIndex === null) return;

    try {
      const updatedTasks = tasks.map((t, i) =>
        i === editingIndex ? updatedTask : t,
      );

      await invoke("save_tasks", { tasks: updatedTasks });

      const reloadedTasks: BackupTask[] = await invoke("load_tasks");
      setTasks(reloadedTasks);
      console.log("Задача переименована");
    } catch (error) {
      console.error("Ошибка синхронизации:", error);
    }

    setIsEditOpen(false);
    setEditingIndex(null);
  };

  return (
    <>
      <div className={styles.tasksSection}>
        <div className={styles.header}>
          <h2 className={styles.title}>Список задач</h2>
          {tasks.length > 0 && (
            <div className={styles.headerButtons}>
              <button
                onClick={onStartBackups}
                className={styles.startButton}
                disabled={tasks.length === 0 || isBackingUp}
              >
                {isBackingUp ? "Выполняется..." : "Запустить бэкапы"}{" "}
                <HiRocketLaunch className="reactIcon" />
              </button>
              <button
                onClick={onDeleteAllTasks}
                className={styles.deleteAllButton}
              >
                Удалить все задачи <MdDeleteForever className="reactIcon" />
              </button>
            </div>
          )}
        </div>
        {tasks.length === 0 ? (
          <p className={styles.noTask}>Нет задач. Добавьте новую.</p>
        ) : (
          <ul className={styles.taskList}>
            {tasks.map((task, index) => (
              <li key={index} className={styles.taskItem}>
                <div className={styles.taskDetails}>
                  <span>
                    Название:{" "}
                    <span className={styles.taskName}>{task.name}</span>
                  </span>
                  <span>
                    Источник:{" "}
                    <span className={styles.taskPath}>{task.source}</span>
                  </span>
                  <span>
                    Цель:{" "}
                    <span className={styles.taskPath}>{task.destination}</span>
                  </span>
                </div>

                <div className={styles.taskButtons}>
                  <button
                    onClick={() => onStartSingleBackup(index)}
                    className={styles.startSingleButton}
                    disabled={isBackingUp}
                  >
                    Запустить
                  </button>

                  <button
                    onClick={() => onDeleteTask(index)}
                    className={styles.deleteButton}
                  >
                    Удалить
                  </button>

                  <button
                    className={styles.editButton}
                    onClick={() => handleEditOpen(index)}
                  >
                    <FaEdit className="reactIcon" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {editingIndex !== null && (
        <EditModal
          task={tasks[editingIndex]}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
};

export default TaskListPanel;
