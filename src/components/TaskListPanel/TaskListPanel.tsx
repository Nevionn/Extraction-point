import React from "react";
import styles from "./TaskListPanel.module.css";
import { HiRocketLaunch } from "react-icons/hi2";
import { MdDeleteForever } from "react-icons/md";
import "../../App.css";

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
  onStartSingleBackup: (index: number) => void;
  isBackingUp: boolean;
}

/**
 * Компонент для управления существующими задачами.
 * Можно удалить как отдельно взятую задачу, так и все разом.
 * Также запускает процесс бэкапа всех задач или отдельной задачи.
 *
 * @returns {JSX.Element}
 */
const TaskListPanel: React.FC<TaskListPanelProps> = ({
  tasks,
  onDeleteTask,
  onDeleteAllTasks,
  onStartBackups,
  onStartSingleBackup,
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
                  Название: <span className={styles.taskName}>{task.name}</span>
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskListPanel;
