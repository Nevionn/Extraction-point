import React, { useState, useEffect } from "react";
import { IoClose, IoCopyOutline } from "react-icons/io5";
import { openUrl } from "@tauri-apps/plugin-opener";
import { invoke } from "@tauri-apps/api/core";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import appIcon from "../../../assets/app-icon.webp";
import styles from "./AboutModal.module.css";

interface GitHubRelease {
  tag_name: string;
}

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [dbPath, setDbPath] = useState("Загрузка пути...");
  const [currentVersion] = useState("1.1.2");
  const [latestRelease, setLatestRelease] = useState<string | null>(null);
  const [loadingUpdate, setLoadingUpdate] = useState(true);

  const BASE_PATH: string =
    "C:\\Users\\You\\AppData\\Roaming\\com.extraction.point\\tasks.db";

  const GITHUB_URL: string = "https://github.com/Nevionn/Extraction-point";
  const RELEASES_API_URL: string =
    "https://api.github.com/repos/Nevionn/Extraction-point/releases/latest";

  useEffect(() => {
    async function fetchDbPath() {
      try {
        const path = await invoke("get_db_path_to_str");
        setDbPath(path as string);
      } catch (err) {
        console.error("Ошибка получения пути к базе данных:", err);
        setDbPath(BASE_PATH);
      }
    }
    fetchDbPath();
  }, []);

  useEffect(() => {
    async function checkForUpdates() {
      try {
        const response = await tauriFetch(RELEASES_API_URL, {
          method: "GET",
          headers: {
            Accept: "application/vnd.github+json",
            "User-Agent": "ExtractionPoint/1.0.0",
          },
        });
        if (response.ok) {
          const data: GitHubRelease = await response.json();
          const latestTag = data.tag_name;
          setLatestRelease(latestTag);
        }
      } catch (err) {
        console.error("Ошибка проверки обновлений:", err);
      } finally {
        setLoadingUpdate(false);
      }
    }
    checkForUpdates();
  }, []);

  const handleCopyPath = async () => {
    try {
      const folderPath = dbPath.substring(0, dbPath.lastIndexOf("\\"));
      await writeText(folderPath);
      console.log("Путь скопирован в буфер обмена:", folderPath);
    } catch (err) {
      console.error("Ошибка копирования пути:", err);
    }
  };

  if (!isOpen) return null;

  const handleOpenGitHub = async () => {
    try {
      await openUrl(GITHUB_URL);
    } catch (err) {
      console.error("Ошибка открытия ссылки:", err);
    }
  };

  const handleOpenReleases = async () => {
    try {
      await openUrl(`${GITHUB_URL}/releases`);
    } catch (err) {
      console.error("Ошибка открытия релизов:", err);
    }
  };

  const hasUpdate =
    latestRelease &&
    latestRelease.replace("v", "") > currentVersion &&
    !loadingUpdate;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeIcon} onClick={onClose}>
          <IoClose size={24} />
        </button>
        <h2 className={styles.title}>О программе</h2>
        <div className={styles.content}>
          <p className={styles.nameProgramm}>
            <strong>Extraction Point</strong>
          </p>
          <img src={appIcon} alt="App Icon" className={styles.appIcon} />
          <div className={styles.description}>
            <p>
              Приложение для резервного копирования и переноса файлов между
              дисками или директориями.
            </p>
          </div>

          <p>Путь к базе данных:</p>
          <div className={styles.pathItem}>
            <p>{dbPath}</p>
            <button className={styles.copyButton} onClick={handleCopyPath}>
              <IoCopyOutline size={20} />
            </button>
          </div>
          <p>
            Автор:{" "}
            <a className={styles.authorLink} onClick={handleOpenGitHub}>
              Nevionn
            </a>
          </p>
          <div className={styles.versionContainer}>
            <p>Версия: {currentVersion}</p>
            {hasUpdate && (
              <a className={styles.updateLink} onClick={handleOpenReleases}>
                Обновиться до {latestRelease}
              </a>
            )}
            {loadingUpdate && <p>Проверка обновлений...</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
