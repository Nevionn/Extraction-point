// src/pages/MainPage/MainPage.tsx
import React, { useState } from "react";
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

  const handleAddTask = () => {
    if (name && source && destination) {
      setTasks([...tasks, { name, source, destination }]);
      setName("");
      setSource("");
      setDestination("");
    }
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
      <TaskListPanel tasks={tasks} />
      <button className={styles.startButton}>Запустить бэкапы</button>
    </div>
  );
};

export default MainPage;
