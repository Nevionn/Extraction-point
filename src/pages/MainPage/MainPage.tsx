import React, { useState } from "react";
import { useBackupTasks } from "../../hooks/useBackupTasks";
import { useBackupProgress } from "../../hooks/useBackupProgress";
import AddTaskPanel from "../../components/panels/AddTaskPanel/AddTaskPanel";
import TaskListPanel from "../../components/panels/TaskListPanel/TaskListPanel";
import ProgressSection from "../../components/panels/ProgressSection/ProgressSection";
import StatusSection from "../../components/panels/StatusSection/StatusSection";
import SettingsModal from "../../components/modals/SettingsModal/SettingsModal";
import AboutModal from "../../components/modals/AboutModal/AboutModal";
import styles from "./MainPage.module.css";
import { RiSettings5Fill } from "react-icons/ri";
import { FaInfoCircle } from "react-icons/fa";

/**
 * Главная страница приложения бэкапа файлов.
 *
 * Компонент обеспечивает:
 * - Управление задачами через хук `useBackupTasks`
 * - Управление прогрессом бэкапов через хук `useBackupProgress`
 * - Добавление, удаление и запуск задач бэкапа
 * - Drag&Drop сортировку задач
 * - Отображение панели добавления задач, списка задач, прогресса и статусов
 * - Модальные окна "Настройки" и "О программе"
 *
 * @component
 * @returns {JSX.Element} Главная страница приложения
 */

const MainPage: React.FC = () => {
  const {
    tasks,
    name,
    source,
    destination,
    setName,
    setSource,
    setDestination,
    handleAddTask,
    handleDeleteTask,
    handleDeleteAllTasks,
    updateTasksOrder,
    status,
    setStatus,
  } = useBackupTasks();

  const {
    progress,
    setProgress,
    isBackingUp,
    handleStartBackups,
    handleStartSingleBackup,
  } = useBackupProgress(tasks, setStatus);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const handleStartSingleBackupWithId = (id: string) => {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return;
    handleStartSingleBackup(index);
  };

  /**
   * Удаление задачи по id с обновлением прогресса
   * @param {string} id - идентификатор задачи
   */

  const handleDeleteTaskWithProgress = (id: string) => {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return;

    const taskName = handleDeleteTask(index);
    setProgress((prev) => {
      const newProgress = new Map(prev);
      newProgress.delete(taskName);
      return newProgress;
    });
  };

  /** Удаление всех задач с очисткой прогресса */

  const handleDeleteAllTasksWithProgress = () => {
    handleDeleteAllTasks();
    setProgress(new Map());
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Бэкап файлов</h1>

      {/* Панель системных кнопок */}
      <div className={styles.systemItem}>
        <div className={styles.systemItemElements}>
          <button
            className={styles.button}
            onClick={() => setIsSettingsOpen(true)}
          >
            Настройки <RiSettings5Fill className="reactIcon" />
          </button>
          <button
            className={styles.button}
            onClick={() => setIsAboutOpen(true)}
          >
            О программе <FaInfoCircle className="reactIcon" />
          </button>
        </div>
      </div>

      {/* Основные колонки страницы */}
      <div className={styles.columns}>
        <div className={styles.column}>
          {/* Панель добавления задач */}
          <AddTaskPanel
            name={name}
            source={source}
            destination={destination}
            onNameChange={setName}
            onSourceChange={setSource}
            onDestinationChange={setDestination}
            onAddTask={handleAddTask}
            onStatusUpdate={setStatus}
          />

          {/* Список задач с поддержкой drag&drop */}
          <TaskListPanel
            tasks={tasks}
            onUpdateTasks={updateTasksOrder}
            onDeleteTask={handleDeleteTaskWithProgress}
            onDeleteAllTasks={handleDeleteAllTasksWithProgress}
            onStartBackups={handleStartBackups}
            onStartSingleBackup={handleStartSingleBackupWithId}
            isBackingUp={isBackingUp}
          />
        </div>

        <div className={styles.column}>
          {/* Прогресс выполнения задач */}
          <ProgressSection progress={progress} />
          {/* Статусные сообщения */}
          <StatusSection status={status} />
        </div>
      </div>

      {/* Модальные окна */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
};

export default MainPage;
