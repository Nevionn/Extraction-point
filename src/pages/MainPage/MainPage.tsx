import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import AddTaskPanel from "../../components/AddTaskPanel/AddTaskPanel";
import TaskListPanel from "../../components/TaskListPanel/TaskListPanel";
import styles from "./MainPage.module.css";

interface BackupTask {
  name: string;
  source: string;
  destination: string;
}

const MainPage: React.FC = () => {
  const [tasks, setTasks] = useState<BackupTask[]>([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string[]>([]);

  const handleAddTask = () => {
    if (name && source && destination) {
      setTasks([...tasks, { name, source, destination }]);
      setName("");
      setSource("");
      setDestination("");
    }
  };

  const handleDeleteTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
    setStatus(status.filter((_, i) => i !== index));
  };

  const handleDeleteAllTasks = () => {
    setTasks([]);
    setStatus([]);
  };

  const handleStartBackups = async () => {
    setStatus([]);
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
        disabled={tasks.length === 0}
      >
        Запустить бэкапы
      </button>
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
