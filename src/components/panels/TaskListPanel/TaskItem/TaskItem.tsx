import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./TaskItem.module.css";
import { BackupTask } from "../../../hooks/useBackupTasks";
import { TbDragDrop } from "react-icons/tb";

interface TaskItemProps {
  task: BackupTask;
  onDeleteTask: (id: string) => void;
  onStartSingleBackup: (id: string) => void;
  isBackingUp: boolean;
}

/**
 * Компонент одного элемента списка задач с drag&drop
 * TaskListPanel -> TaskItem
 * @component
 */

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onDeleteTask,
  onStartSingleBackup,
  isBackingUp,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} className={styles.taskItem}>
      <div className={styles.dragHandle} {...attributes} {...listeners}>
        <TbDragDrop />
      </div>
      <div className={styles.taskDetails}>
        <span>
          Название: <span className={styles.taskName}>{task.name}</span>
        </span>
        <span>
          Источник: <span className={styles.taskPath}>{task.source}</span>
        </span>
        <span>
          Цель: <span className={styles.taskPath}>{task.destination}</span>
        </span>
      </div>
      <div className={styles.taskButtons}>
        <button
          onClick={() => onStartSingleBackup(task.id)}
          disabled={isBackingUp}
          className={styles.startSingleButton}
        >
          Запустить
        </button>
        <button
          onClick={() => onDeleteTask(task.id)}
          className={styles.deleteButton}
        >
          Удалить
        </button>
      </div>
    </li>
  );
};

export default TaskItem;
