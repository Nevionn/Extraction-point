import React, { useState, useEffect } from "react";
import styles from "./EditModal.module.css";
import { BackupTask } from "../../../hooks/useBackupTasks";
import { useSelectDirectory } from "../../../hooks/useSelectDirectory";

interface EditModalProps {
  task: BackupTask;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: BackupTask) => void;
}

/**
 * Компонет модального окна, позволяющий редактировать поля задачи
 *
 * @component
 */

const EditModal: React.FC<EditModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
}) => {
  const { selectDirectory } = useSelectDirectory();

  const [form, setForm] = useState<BackupTask>({
    name: "",
    source: "",
    destination: "",
  });

  useEffect(() => {
    function fillForm() {
      if (task && isOpen) {
        setForm(task);
      }
    }

    fillForm();
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.source.trim() || !form.destination.trim()) {
      alert("Заполните все обязательные поля");
      return;
    }
    onSave(form);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Редактирование задачи</h2>
          <button className={styles.closeBtn} onClick={onClose} title="Закрыть">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name">Название задачи</label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="source">Источник</label>

            <div className={styles.pathRow}>
              <input
                type="text"
                id="source"
                name="source"
                value={form.source}
                onChange={handleChange}
                required
                readOnly
              />

              <button
                type="button"
                onClick={() =>
                  selectDirectory("Выберите исходную папку", (value) =>
                    setForm((prev) => ({ ...prev, source: value })),
                  )
                }
                className={styles.selectBtn}
              >
                Выбрать
              </button>
            </div>

            <small>Путь к файлу или папке, которую нужно резервировать</small>
          </div>

          <div className={styles.field}>
            <label htmlFor="destination">Цель</label>

            <div className={styles.pathRow}>
              <input
                type="text"
                id="destination"
                name="destination"
                value={form.destination}
                onChange={handleChange}
                required
                readOnly
              />

              <button
                type="button"
                onClick={() =>
                  selectDirectory("Выберите целевую папку", (value) =>
                    setForm((prev) => ({ ...prev, source: value })),
                  )
                }
                className={styles.selectBtn}
              >
                Выбрать
              </button>
            </div>

            <small>Папка, в которую будет выполняться копирование</small>
          </div>

          <div className={styles.buttons}>
            <button type="submit" className={styles.save}>
              Сохранить
            </button>
            <button type="button" onClick={onClose} className={styles.cancel}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
