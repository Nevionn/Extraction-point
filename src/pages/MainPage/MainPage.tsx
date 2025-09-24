import React, { useState } from "react";
import AddTaskPanel from "../../components/AddTaskPanel/AddTaskPanel";
import TaskListPanel from "../../components/TaskListPanel/TaskListPanel";
import styles from "./MainPage.module.css";

interface BackupTask {
  source: string;
  destination: string;
}

const MainPage: React.FC = () => {
  const [tasks, setTasks] = useState<BackupTask[]>([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  const handleAddTask = () => {
    if (source && destination) {
      setTasks([...tasks, { source, destination }]);
      setSource("");
      setDestination("");
    }
  };

  return (
    <div className={styles.container}>
      <h1>Бэкап файлов</h1>
      <AddTaskPanel
        source={source}
        destination={destination}
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
