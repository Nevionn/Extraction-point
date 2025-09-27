import React from "react";
import ProgressBar from "../ProgressBar/ProgressBar";
import styles from "./ProgressSection.module.css";

interface Progress {
  taskName: string;
  progress: number;
}

interface ProgressSectionProps {
  progress: Map<string, Progress>;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({ progress }) => {
  return (
    <div className={styles.progresItem}>
      <h2>Прогресс задачи</h2>
      {progress.size === 0 ? (
        <span className={styles.noTask}>Нет активных процессов</span>
      ) : (
        Array.from(progress.values()).map((prog) => (
          <ProgressBar
            key={prog.taskName || Math.random()}
            taskName={prog.taskName}
            progress={prog.progress}
          />
        ))
      )}
    </div>
  );
};

export default ProgressSection;
