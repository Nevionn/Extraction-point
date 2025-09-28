import React, { useState, useEffect } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { invoke } from "@tauri-apps/api/core";
import appIcon from "../../../assets/app-icon.webp";
import { IoClose } from "react-icons/io5";
import styles from "./AboutModal.module.css";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [dbPath, setDbPath] = useState("Загрузка пути...");

  useEffect(() => {
    async function fetchDbPath() {
      try {
        const path = await invoke("get_db_path_to_str");
        setDbPath(path as string);
      } catch (err) {
        console.error("Ошибка получения пути к базе данных:", err);
        setDbPath(
          "C:\\Users\\You\\AppData\\Roaming\\com.extraction.point\\tasks.db"
        );
      }
    }
    fetchDbPath();
  }, []);

  if (!isOpen) return null;

  const handleOpenGitHub = async () => {
    try {
      await openUrl("https://github.com/Nevionn/Extraction-point");
    } catch (err) {
      console.error("Ошибка открытия ссылки:", err);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeIcon} onClick={onClose}>
          <IoClose size={24} />
        </button>
        <h2 className={styles.title}>О программе</h2>
        <div className={styles.content}>
          <p>
            <strong>Extraction Point</strong>
          </p>
          <img src={appIcon} alt="App Icon" className={styles.appIcon} />
          <p>
            Приложение для резервного копирования и переноса файлов между
            дисками или директориями.
          </p>
          <p>Путь к базе данных:</p>
          <div className={styles.pathItem}>
            <p>{dbPath}</p>
          </div>
          <p>
            Автор:{" "}
            <a className={styles.authorLink} onClick={handleOpenGitHub}>
              Nevionn
            </a>
          </p>
          <p>Версия: 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
