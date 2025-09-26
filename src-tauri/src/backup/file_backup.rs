use std::fs::{self};
use std::path::Path;
use tauri::command;

#[command]
pub fn backup_directory(source: String, destination: String, task_name: String) -> Result<String, String> {
    let source_path = Path::new(&source);
    let destination_path = Path::new(&destination);

    if !source_path.exists() || !source_path.is_dir() {
        return Err(format!("Исходная папка '{}' не существует или не является директорией", source));
    }

    if !destination_path.exists() {
        fs::create_dir_all(destination_path)
            .map_err(|e| format!("Ошибка создания целевой папки '{}': {}", destination, e))?;
    }

    copy_dir_recursive(source_path, destination_path)
        .map_err(|e| format!("Ошибка копирования для задачи '{}': {}", task_name, e))?;

    Ok(format!("Задача '{}' успешно выполнена: скопировано из '{}' в '{}'", task_name, source, destination))
}

fn copy_dir_recursive(source: &Path, destination: &Path) -> std::io::Result<()> {
    for entry in fs::read_dir(source)? {
        let entry = entry?;
        let entry_path = entry.path();
        let dest_path = destination.join(entry.file_name());

        if entry_path.is_dir() {
            fs::create_dir_all(&dest_path)?;
            copy_dir_recursive(&entry_path, &dest_path)?;
        } else {
            fs::copy(&entry_path, &dest_path)?;
        }
    }
    Ok(())
}