import React from "react";
import styles from "./SettingsModal.module.css";
import { useTheme } from "../../../hooks/useTheme";
import HeaderModal from "../HeaderModal/HeaderModal";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <HeaderModal title="Настройки" onClose={onClose} />

        <div className={styles.content}>
          <h3 className={styles.title}>Оформление</h3>

          <div className={styles.tabContainer}>
            <button
              className={`${styles.tab} ${theme === "ametist" ? styles.activeTab : ""}`}
              onClick={() => theme !== "ametist" && toggleTheme()}
            >
              Ametist
            </button>
            <button
              className={`${styles.tab} ${theme === "onyx" ? styles.activeTab : ""}`}
              onClick={() => theme !== "onyx" && toggleTheme()}
            >
              Onyx
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
