// src/components/AddTaskPanel/AddTaskPanel.tsx
import React, { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
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
  const handleSelectSource = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Выберите исходную папку",
      });
      if (selected) {
        onSourceChange(selected as string);
      }
    } catch (error) {
      console.error("Ошибка выбора исходной папки:", error);
    }
  };

  const handleSelectDestination = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Выберите целевую папку",
      });
      if (selected) {
        onDestinationChange(selected as string);
      }
    } catch (error) {
      console.error("Ошибка выбора целевой папки:", error);
    }
  };

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
          readOnly
        />
        <button onClick={handleSelectSource} className={styles.button}>
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
          className={styles.input}
          readOnly
        />
        <button onClick={handleSelectDestination} className={styles.button}>
          Выбрать
        </button>
      </div>
      <button
        onClick={onAddTask}
        className={styles.addButton}
        disabled={!source || !destination}
      >
        Добавить задачу
      </button>
    </div>
  );
};

export default AddTaskPanel;
