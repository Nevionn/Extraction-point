import React from "react";
import styles from "./TaskListPanel.module.css";

interface BackupTask {
  name: string;
  source: string;
  destination: string;
}

interface TaskListPanelProps {
  tasks: BackupTask[];
  onDeleteTask: (index: number) => void;
  onDeleteAllTasks: () => void;
  onStartBackups: () => void;
  isBackingUp: boolean;
}

/**
 * Компонент для управления существующими задачами.
 * Можно удалить как отдельно взятую задачу, так и все разом.
 * Также запускает процесс бэкапа всех задач.
 *
 * @returns {JSX.Element}
 */
const TaskListPanel: React.FC<TaskListPanelProps> = ({
  tasks,
  onDeleteTask,
  onDeleteAllTasks,
  onStartBackups,
  isBackingUp,
}) => {
  return (
    <div className={styles.tasksSection}>
      <div className={styles.header}>
        <h2>Список задач бэкапа</h2>
        {tasks.length > 0 && (
          <div className={styles.headerButtons}>
            <button
              onClick={onStartBackups}
              className={styles.startButton}
              disabled={tasks.length === 0 || isBackingUp}
            >
              {isBackingUp ? "Выполняется..." : "Запустить бэкапы"}
            </button>
            <button
              onClick={onDeleteAllTasks}
              className={styles.deleteAllButton}
            >
              Удалить все задачи
            </button>
          </div>
        )}
      </div>
      {tasks.length === 0 ? (
        <p>Нет задач. Добавьте новую.</p>
      ) : (
        <ul className={styles.taskList}>
          {tasks.map((task, index) => (
            <li key={index} className={styles.taskItem}>
              <div className={styles.taskDetails}>
                <span>Название: {task.name}</span>
                <span>Источник: {task.source}</span>
                <span>Цель: {task.destination}</span>
              </div>
              <button
                onClick={() => onDeleteTask(index)}
                className={styles.deleteButton}
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskListPanel;
