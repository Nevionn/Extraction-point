import React from "react";
import styles from "./StatusSection.module.css";

interface StatusSectionProps {
  status: string[]; // Массив сообщений о статусе
}

/**
 * Компонент для отображения статуса выполнения бэкапов.
 * Показывает список сообщений об успехе или ошибках для каждой задачи.
 *
 * @returns {JSX.Element}
 */
const StatusSection: React.FC<StatusSectionProps> = ({ status }) => {
  return (
    <div className={styles.statusSection}>
      <h2>Статус бэкапов</h2>
      <ul className={styles.statusList}>
        {status.map((message, index) => (
          <li key={index} className={styles.statusItem}>
            {message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatusSection;
