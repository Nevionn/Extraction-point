import React, { useState, useEffect } from "react";
import styles from "./TaskListPanel.module.css";
import { HiRocketLaunch } from "react-icons/hi2";
import { MdDeleteForever } from "react-icons/md";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { BackupTask } from "../../hooks/useBackupTasks";
import TaskItem from "./TaskItem/TaskItem";

interface TaskListPanelProps {
  tasks: BackupTask[];
  /** Функция для обновления порядка задач после drag&drop */
  onUpdateTasks: (newTasks: BackupTask[]) => void;
  onDeleteTask: (id: string) => void;
  onDeleteAllTasks: () => void;
  onStartBackups: () => void;
  onStartSingleBackup: (id: string) => void;
  /** Флаг, показывающий, что бэкап сейчас выполняется */
  isBackingUp: boolean;
}

/**
 * Компонент для управления существующими задачами.
 * Можно удалить как отдельно взятую задачу, так и все разом.
 * Также запускает процесс бэкапа всех задач или отдельной задачи.
 * Обеспечивает drag&drop
 *
 * @component
 */

const TaskListPanel: React.FC<TaskListPanelProps> = ({
  tasks,
  onUpdateTasks,
  onDeleteTask,
  onDeleteAllTasks,
  onStartBackups,
  onStartSingleBackup,
  isBackingUp,
}) => {
  const [orderedTasks, setOrderedTasks] = useState<BackupTask[]>(tasks);

  useEffect(() => {
    setOrderedTasks(tasks);
  }, [tasks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedTasks.findIndex((t) => t.id === active.id);
    const newIndex = orderedTasks.findIndex((t) => t.id === over.id);

    const newTasks = arrayMove(orderedTasks, oldIndex, newIndex);
    setOrderedTasks(newTasks);
    onUpdateTasks(newTasks);
  };

  return (
    <div className={styles.tasksSection}>
      <div className={styles.header}>
        <h2 className={styles.title}>Список задач</h2>
        {orderedTasks.length > 0 && (
          <div className={styles.headerButtons}>
            <button
              onClick={onStartBackups}
              disabled={isBackingUp}
              className={styles.startButton}
            >
              {isBackingUp ? "Выполняется..." : "Запустить бэкапы"}{" "}
              <HiRocketLaunch className="reactIcon" />
            </button>
            <button
              onClick={onDeleteAllTasks}
              className={styles.deleteAllButton}
            >
              Удалить все задачи <MdDeleteForever className="reactIcon" />
            </button>
          </div>
        )}
      </div>

      {orderedTasks.length === 0 ? (
        <p className={styles.noTask}>Нет задач. Добавьте новую.</p>
      ) : (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className={styles.taskList}>
              {orderedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onDeleteTask={onDeleteTask}
                  onStartSingleBackup={onStartSingleBackup}
                  isBackingUp={isBackingUp}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default TaskListPanel;
