import React from "react";
import styles from "./AddTaskPanel.module.css";

interface AddTaskPanelProps {
  source: string;
  destination: string;
  onSourceChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onAddTask: () => void;
}

const AddTaskPanel: React.FC<AddTaskPanelProps> = ({
  source,
  destination,
  onSourceChange,
  onDestinationChange,
  onAddTask,
}) => {
  return (
    <div className={styles.addTaskSection}>
      <h2>Добавить задачу бэкапа</h2>
      <div className={styles.inputGroup}>
        <label>Исходная папка:</label>
        <input
          type="text"
          value={source}
          onChange={(e) => onSourceChange(e.target.value)}
          placeholder="Выберите исходную папку..."
          className={styles.input}
        />
        <button className={styles.button}>Выбрать</button>
      </div>
      <div className={styles.inputGroup}>
        <label>Целевая папка:</label>
        <input
          type="text"
          value={destination}
          onChange={(e) => onDestinationChange(e.target.value)}
          placeholder="Выберите целевую папку..."
          className={styles.input}
        />
        <button className={styles.button}>Выбрать</button>
      </div>
      <button onClick={onAddTask} className={styles.addButton}>
        Добавить задачу
      </button>
    </div>
  );
};

export default AddTaskPanel;
