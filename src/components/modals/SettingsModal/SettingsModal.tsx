import React from "react";
import { IoClose } from "react-icons/io5";
import styles from "./SettingsModal.module.css";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeIcon} onClick={onClose}>
          <IoClose size={24} />
        </button>
        <h2 className={styles.title}>Настройки</h2>
        <div className={styles.content}>
          <p>В разработке</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
