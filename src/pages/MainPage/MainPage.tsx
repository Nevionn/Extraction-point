import React, { useState } from "react";
import { useBackupTasks } from "../../hooks/useBackupTasks";
import { useBackupProgress } from "../../hooks/useBackupProgress";
import AddTaskPanel from "../../components/AddTaskPanel/AddTaskPanel";
import TaskListPanel from "../../components/TaskListPanel/TaskListPanel";
import ProgressSection from "../../components/ProgressSection/ProgressSection";
import StatusSection from "../../components/StatusSection/StatusSection";
import SettingsModal from "../../components/modals/SettingsModal/SettingsModal";
import AboutModal from "../../components/modals/AboutModal/AboutModal";
import styles from "./MainPage.module.css";
import { RiSettings5Fill } from "react-icons/ri";
import { FaInfoCircle } from "react-icons/fa";

/**
 * Компонент главной страницы, на которой располагаются основные компоненты-виджеты для управления созданием, выполнением и отображением результатов задач бэкапа.
 *
 * @returns {JSX.Element}
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

  const handleDeleteTaskWithProgress = (index: number) => {
    const taskName = handleDeleteTask(index);
    setProgress((prev) => {
      const newProgress = new Map(prev);
      newProgress.delete(taskName);
      return newProgress;
    });
  };

  const handleDeleteAllTasksWithProgress = () => {
    handleDeleteAllTasks();
    setProgress(new Map());
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Бэкап файлов</h1>
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

      <div className={styles.columns}>
        {/* Левая колонка */}
        <div className={styles.column}>
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
          <TaskListPanel
            tasks={tasks}
            onDeleteTask={handleDeleteTaskWithProgress}
            onDeleteAllTasks={handleDeleteAllTasksWithProgress}
            onStartBackups={handleStartBackups}
            onStartSingleBackup={handleStartSingleBackup}
            isBackingUp={isBackingUp}
          />
        </div>

        {/* Правая колонка */}
        <div className={styles.column}>
          <ProgressSection progress={progress} />
          <StatusSection status={status} />
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
};

export default MainPage;
