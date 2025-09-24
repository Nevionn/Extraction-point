import React from "react";
import styles from "./TaskListPanel.module.css";

interface BackupTask {
  source: string;
  destination: string;
}

interface TaskListPanelProps {
  tasks: BackupTask[];
}

const TaskListPanel: React.FC<TaskListPanelProps> = ({ tasks }) => {
  return (
    <div className={styles.tasksSection}>
      <h2>Список задач бэкапа</h2>
      {tasks.length === 0 ? (
        <p>Нет задач. Добавьте новую.</p>
      ) : (
        <ul className={styles.taskList}>
          {tasks.map((task, index) => (
            <li key={index} className={styles.taskItem}>
              <span>Источник: {task.source}</span>
              <span>Цель: {task.destination}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskListPanel;
