import React from "react";
import { MdTask } from "react-icons/md";
import { useSelectDirectory } from "../../../hooks/useSelectDirectory";
import styles from "./AddTaskPanel.module.css";

interface AddTaskPanelProps {
  name: string;
  source: string;
  destination: string;
  onNameChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onAddTask: () => void;
  onStatusUpdate: (status: string[]) => void;
}

/**
 * Компонент панели для создание задачи.
 * Принимает: название задачи, входную и выходную директорию
 *
 * @returns {JSX.Element}
 */

const AddTaskPanel: React.FC<AddTaskPanelProps> = ({
  name,
  source,
  destination,
  onNameChange,
  onSourceChange,
  onDestinationChange,
  onAddTask,
  onStatusUpdate,
}) => {
  const { selectDirectory } = useSelectDirectory(onStatusUpdate);

  return (
    <div className={styles.addTaskSection}>
      <div className={styles.titleItem}>
        <h2 className={styles.title}>Добавить задачу бэкапа</h2>
      </div>
      <div className={styles.inputGroup}>
        <label>Название задачи:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Введите название задачи"
          className={styles.field}
        />
      </div>
      <div className={styles.inputGroup}>
        <label>Исходная папка:</label>
        <input
          type="text"
          value={source}
          onChange={(e) => onSourceChange(e.target.value)}
          placeholder="Выберите исходную папку..."
          className={styles.field}
          readOnly
        />
        <button
          onClick={() =>
            selectDirectory("Выберите исходную папку", onSourceChange)
          }
          className={styles.button}
        >
          Выбрать
        </button>
      </div>
      <div className={styles.inputGroup}>
        <label>Целевая папка:</label>
        <input
          type="text"
          value={destination}
          onChange={(e) => onDestinationChange(e.target.value)}
          placeholder="Выберите целевую папку..."
          className={styles.field}
          readOnly
        />
        <button
          onClick={() =>
            selectDirectory("Выберите целевую папку", onDestinationChange)
          }
          className={styles.button}
        >
          Выбрать
        </button>
      </div>
      <button
        onClick={onAddTask}
        className={styles.addButton}
        disabled={!name || !source || !destination}
      >
        Добавить задачу <MdTask className="reactIcon" />
      </button>
    </div>
  );
};

export default AddTaskPanel;
