import React from "react";
import { useBackupTasks } from "../../hooks/useBackupTasks";
import { useBackupProgress } from "../../hooks/useBackupProgress";
import AddTaskPanel from "../../components/AddTaskPanel/AddTaskPanel";
import TaskListPanel from "../../components/TaskListPanel/TaskListPanel";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import StatusSection from "../../components/StatusSection/StatusSection";
import styles from "./MainPage.module.css";

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

  const handleDeleteTaskWithProgress = (index: number) => {
    const taskName = handleDeleteTask(index);
    setProgress((prev) => {
      const newProgress = new Map(prev);
      newProgress.delete(taskName);
      return newProgress;
    });
  };

  return (
    <div className={styles.container}>
      <h1>Бэкап файлов</h1>
      <AddTaskPanel
        name={name}
        source={source}
        destination={destination}
        onNameChange={setName}
        onSourceChange={setSource}
        onDestinationChange={setDestination}
        onAddTask={handleAddTask}
      />
      <TaskListPanel
        tasks={tasks}
        onDeleteTask={handleDeleteTaskWithProgress}
        onDeleteAllTasks={handleDeleteAllTasks}
        onStartBackups={handleStartBackups}
        onStartSingleBackup={handleStartSingleBackup}
        isBackingUp={isBackingUp}
      />
      {progress.size > 0 && (
        <div className={styles.progressSection}>
          <h2>Прогресс бэкапов</h2>
          {Array.from(progress.values()).map((prog) => (
            <ProgressBar
              key={prog.taskName}
              taskName={prog.taskName}
              progress={prog.progress}
            />
          ))}
        </div>
      )}
      <StatusSection status={status} />
    </div>
  );
};

export default MainPage;
