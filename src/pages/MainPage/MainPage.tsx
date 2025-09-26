import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import AddTaskPanel from "../../components/AddTaskPanel/AddTaskPanel";
import TaskListPanel from "../../components/TaskListPanel/TaskListPanel";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import StatusSection from "../../components/StatusSection/StatusSection";
import styles from "./MainPage.module.css";

interface BackupTask {
  name: string;
  source: string;
  destination: string;
}

interface Progress {
  taskName: string;
  copiedFiles: number;
  totalFiles: number;
  progress: number;
}

/**
 * Компонент главной страницы, на которой располагаются основные компоненты-виджеты для управления созданием, выполнением и отображением результатов задач бэкапа.
 *
 * @returns {JSX.Element}
 */
const MainPage: React.FC = () => {
  const [tasks, setTasks] = useState<BackupTask[]>([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [name, setName] = useState("");

  const [progress, setProgress] = useState<Map<string, Progress>>(new Map());
  const [status, setStatus] = useState<string[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const loadedTasks: BackupTask[] = await invoke("load_tasks", {});
        setTasks(loadedTasks);
      } catch (error) {
        console.log("Не удалось загрузить задачи:", error);
        setStatus((prev) => [...prev, `Ошибка загрузки задач: ${error}`]);
      }
    };

    loadTasks();
  }, []);

  const saveTasks = async (newTasks: BackupTask[]) => {
    try {
      await invoke("save_tasks", { tasks: newTasks });
    } catch (error) {
      console.error("Ошибка при сохранении задач:", error);
      setStatus((prev) => [...prev, `Ошибка сохранения задач: ${error}`]);
    }
  };

  useEffect(() => {
    const unsubscribe = listen("backup_progress", (event) => {
      const payload = event.payload as [string, number, number, number];
      const [taskName, copiedFiles, totalFiles, progressPercent] = payload;
      setProgress((prev) =>
        new Map(prev).set(taskName, {
          taskName,
          copiedFiles,
          totalFiles,
          progress: progressPercent,
        })
      );
    });

    return () => {
      unsubscribe.then((fn) => fn());
    };
  }, []);

  const handleAddTask = () => {
    if (name && source && destination) {
      const newTasks = [...tasks, { name, source, destination }];
      setTasks(newTasks);
      setName("");
      setSource("");
      setDestination("");
      saveTasks(newTasks);
    } else {
      setStatus((prev) => [...prev, "Ошибка: Заполните все поля задачи"]);
    }
  };

  const handleDeleteTask = (index: number) => {
    const taskName = tasks[index].name;
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
    setStatus(status.filter((_, i) => i !== index));
    setProgress((prev) => {
      const newProgress = new Map(prev);
      newProgress.delete(taskName);
      return newProgress;
    });
    saveTasks(newTasks);
  };

  const handleDeleteAllTasks = () => {
    setTasks([]);
    setStatus([]);
    setProgress(new Map());
    saveTasks([]);
  };

  const handleStartBackups = async () => {
    setStatus([]);
    setProgress(new Map());
    setIsBackingUp(true);

    const newStatus: string[] = [];
    for (const task of tasks) {
      try {
        const result = await invoke("backup_directory", {
          source: task.source,
          destination: task.destination,
          taskName: task.name,
        });
        newStatus.push(result as string);
      } catch (error) {
        newStatus.push(`Ошибка в задаче "${task.name}": ${error}`);
      }
    }

    setStatus(newStatus);
    setIsBackingUp(false);
  };

  const handleStartSingleBackup = async (index: number) => {
    setStatus([]);
    setProgress(new Map());
    setIsBackingUp(true);

    const task = tasks[index];
    const newStatus: string[] = [];
    try {
      const result = await invoke("backup_directory", {
        source: task.source,
        destination: task.destination,
        taskName: task.name,
      });
      newStatus.push(result as string);
    } catch (error) {
      newStatus.push(`Ошибка в задаче "${task.name}": ${error}`);
    }

    setStatus(newStatus);
    setIsBackingUp(false);
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
        onDeleteTask={handleDeleteTask}
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
