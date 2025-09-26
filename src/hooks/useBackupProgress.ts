import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { BackupTask } from "./useBackupTasks";

export interface Progress {
  taskName: string;
  copiedFiles: number;
  totalFiles: number;
  progress: number;
}

/**
 * Хук для управления прогрессом бэкапа и статусами (включая выполнение бэкапов).
 */

export const useBackupProgress = (
  tasks: BackupTask[],
  setStatus: (status: string[]) => void
) => {
  const [progress, setProgress] = useState<Map<string, Progress>>(new Map());
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

  return {
    progress,
    setProgress,
    isBackingUp,
    handleStartBackups,
    handleStartSingleBackup,
  };
};
