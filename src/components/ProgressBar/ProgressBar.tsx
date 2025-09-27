import React from "react";
import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  taskName: string;
  progress: number; // Прогресс в процентах (0-100)
}

/**
 * Компонент для отображения состояния процесса копирования файлов
 *
 * @returns {JSX.component}
 */

const ProgressBar: React.FC<ProgressBarProps> = ({ taskName, progress }) => {
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressLabel}>
        <span className={styles.taskName}>{taskName}</span>:{" "}
        {progress.toFixed(0)}%
      </div>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
