import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import AddTaskPanel from "../../components/AddTaskPanel/AddTaskPanel";
import TaskListPanel from "../../components/TaskListPanel/TaskListPanel";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
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

const MainPage: React.FC = () => {
  const [tasks, setTasks] = useState<BackupTask[]>([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [name, setName] = useState("");

  const [progress, setProgress] = useState<Map<string, Progress>>(new Map());
  const [status, setStatus] = useState<string[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);

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
      setTasks([...tasks, { name, source, destination }]);
      setName("");
      setSource("");
      setDestination("");
    }
  };

  const handleDeleteTask = (index: number) => {
    const taskName = tasks[index].name;
    setTasks(tasks.filter((_, i) => i !== index));
    setStatus(status.filter((_, i) => i !== index));
    setProgress((prev) => {
      const newProgress = new Map(prev);
      newProgress.delete(taskName);
      return newProgress;
    });
  };

  const handleDeleteAllTasks = () => {
    setTasks([]);
    setStatus([]);
    setProgress(new Map());
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
      />
      <button
        onClick={handleStartBackups}
        className={styles.startButton}
        disabled={tasks.length === 0 || isBackingUp}
      >
        {isBackingUp ? "Выполняется..." : "Запустить бэкапы"}
      </button>
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
      {status.length > 0 && (
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
      )}
    </div>
  );
};

export default MainPage;
