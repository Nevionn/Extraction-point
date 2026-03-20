import React, { useState } from "react";
import { BackupTask, BackupTaskForm } from "../../hooks/useBackupTasks";
import styles from "./TaskListPanel.module.css";

import EditModal from "../modals/EditModal/EditModal";

import { HiRocketLaunch } from "react-icons/hi2";
import { MdDeleteForever } from "react-icons/md";
import { RiDragDropLine } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";

import { DndContext, closestCenter } from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import "../../App.css";

interface TaskListPanelProps {
  tasks: BackupTask[];
  setTasks: (tasks: BackupTask[]) => void;
  onDeleteTask: (index: number) => void;
  onDeleteAllTasks: () => void;
  onStartBackups: () => void;
  onStartSingleBackup: (index: number) => void;
  onUpdateTask: (index: number, task: BackupTask) => void;
  onUpdateAfterReorder: (tasks: BackupTask[]) => Promise<void>;
  isBackingUp: boolean;
}

/**
 * Компонент для управления существующими задачами.
 * Поддержка DND сортировки.
 * Можно удалить как отдельно взятую задачу, так и все разом.
 * Позволяет редактировать задачу.
 * Также запускает процесс бэкапа всех задач или отдельной задачи.
 *
 * @returns {JSX.Element}
 */

const TaskListPanel: React.FC<TaskListPanelProps> = ({
  tasks,
  onDeleteTask,
  onDeleteAllTasks,
  onStartBackups,
  onStartSingleBackup,
  onUpdateTask,
  onUpdateAfterReorder,
  isBackingUp,
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleEditOpen = (index: number) => {
    setEditingIndex(index);
    onUpdateTask;
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (updatedTask: BackupTaskForm) => {
    if (editingIndex === null) return;

    const originalTask = tasks[editingIndex];

    const fullTask: BackupTask = {
      ...updatedTask,
      sortOrder: originalTask.sortOrder,
    };

    await onUpdateTask(editingIndex, fullTask);

    setIsEditOpen(false);
    setEditingIndex(null);
  };

  // DnD: обработчик окончания перетаскивания
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.name === active.id);
    const newIndex = tasks.findIndex((t) => t.name === over.id);

    const reordered = arrayMove(tasks, oldIndex, newIndex).map(
      (task, index) => ({
        ...task,
        sortOrder: index,
      }),
    );

    // обновляем локально
    reordered && reordered.length && reordered.length > 0 && reordered;

    await onUpdateAfterReorder(reordered);
  };

  /** Компонент для одного элемента списка с DnD */

  const SortableItem = ({
    task,
    children,
  }: {
    task: BackupTask;
    index: number;
    children: (props: any) => React.ReactNode;
  }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: task.name });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <li ref={setNodeRef} style={style}>
        {children({ attributes, listeners })}
      </li>
    );
  };

  return (
    <>
      <div className={styles.tasksSection}>
        <div className={styles.header}>
          <h2 className={styles.title}>Список задач</h2>
          {tasks.length > 0 && (
            <div className={styles.headerButtons}>
              <button
                onClick={onStartBackups}
                className={styles.startButton}
                disabled={tasks.length === 0 || isBackingUp}
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

        {tasks.length === 0 ? (
          <p className={styles.noTask}>Нет задач. Добавьте новую.</p>
        ) : (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tasks.map((t) => t.name)}
              strategy={verticalListSortingStrategy}
            >
              <ul className={styles.taskList}>
                {tasks.map((task, index) => (
                  <SortableItem key={task.name} task={task} index={index}>
                    {({ attributes, listeners }) => (
                      <div className={styles.taskItem}>
                        <button
                          className={styles.dragHandle}
                          {...attributes}
                          {...listeners}
                        >
                          <RiDragDropLine className="reactIcon" />
                        </button>

                        <div className={styles.taskDetails}>
                          <span>
                            Название:{" "}
                            <span className={styles.taskName}>{task.name}</span>
                          </span>
                          <span>
                            Источник:{" "}
                            <span className={styles.taskPath}>
                              {task.source}
                            </span>
                          </span>
                          <span>
                            Цель:{" "}
                            <span className={styles.taskPath}>
                              {task.destination}
                            </span>
                          </span>
                        </div>

                        <div className={styles.taskButtons}>
                          <button
                            className={styles.startSingleButton}
                            onClick={() => onStartSingleBackup(index)}
                            disabled={isBackingUp}
                          >
                            Запустить
                          </button>

                          <button
                            className={styles.deleteButton}
                            onClick={() => onDeleteTask(index)}
                          >
                            Удалить
                          </button>

                          <button
                            className={styles.editButton}
                            onClick={() => handleEditOpen(index)}
                          >
                            <FaEdit className="reactIcon" />
                          </button>
                        </div>
                      </div>
                    )}
                  </SortableItem>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {editingIndex !== null && (
        <EditModal
          task={tasks[editingIndex]}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
};

export default TaskListPanel;
