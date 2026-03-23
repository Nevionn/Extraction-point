import React from "react";
import { IoClose } from "react-icons/io5";
import styles from "./HeaderModal.module.css";

interface HeaderModalProps {
  title: string;
  onClose: () => void;
}

/**
 * Вспомогательный компонент модальных окон для создания универсального хедера
 */

const HeaderModal: React.FC<HeaderModalProps> = ({ title, onClose }) => {
  return (
    <div className={styles.header}>
      <h2>{title}</h2>
      <button className={styles.closeBtn} onClick={onClose} title="Закрыть">
        <IoClose size={24} />
      </button>
    </div>
  );
};

export default HeaderModal;
