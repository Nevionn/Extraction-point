use std::fs::{self};
use std::path::Path;
use tauri::{command, AppHandle, Emitter};

#[command]
pub fn backup_directory(app_handle: AppHandle, source: String, destination: String, task_name: String) -> Result<String, String> {
    let source_path = Path::new(&source);
    let destination_path = Path::new(&destination);

    if !source_path.exists() || !source_path.is_dir() {
        return Err(format!("Исходная папка '{}' не существует или не является директорией", source));
    }

    if !destination_path.exists() {
        fs::create_dir_all(destination_path)
            .map_err(|e| format!("Ошибка создания целевой папки '{}': {}", destination, e))?;
    }

    let total_files = count_files(source_path)
        .map_err(|e| format!("Ошибка подсчёта файлов в '{}': {}", source, e))?;

    let mut copied_files = 0;

    // Копируем с отправкой прогресса
    copy_dir_recursive(source_path, destination_path, &app_handle, &task_name, &mut copied_files, total_files)
        .map_err(|e| format!("Ошибка копирования для задачи '{}': {}", task_name, e))?;

    Ok(format!("Задача '{}' успешно выполнена: скопировано из '{}' в '{}'", task_name, source, destination))
}

fn count_files(source: &Path) -> std::io::Result<usize> {
    let mut count = 0;
    for entry in fs::read_dir(source)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_dir() {
            count += count_files(&path)?;
        } else {
            count += 1;
        }
    }
    Ok(count)
}

// Рекурсивное копирование директории с отправкой прогресса
fn copy_dir_recursive(
    source: &Path,
    destination: &Path,
    app_handle: &AppHandle,
    task_name: &str,
    copied_files: &mut usize,
    total_files: usize,
) -> std::io::Result<()> {
    for entry in fs::read_dir(source)? {
        let entry = entry?;
        let entry_path = entry.path();
        let dest_path = destination.join(entry.file_name());

        if entry_path.is_dir() {
            fs::create_dir_all(&dest_path)?;
            copy_dir_recursive(&entry_path, &dest_path, app_handle, task_name, copied_files, total_files)?;
        } else {
            fs::copy(&entry_path, &dest_path)?;
            *copied_files += 1;
            // Отправляем событие прогресса
            let progress = (*copied_files as f32 / total_files as f32 * 100.0).min(100.0);
            app_handle.emit("backup_progress", (task_name, *copied_files, total_files, progress)).expect("Failed to emit progress");
        }
    }
    Ok(())
}