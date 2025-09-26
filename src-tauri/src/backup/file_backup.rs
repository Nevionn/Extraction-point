use std::fs;
use std::path::{Path, PathBuf};
use tauri::{Emitter, Manager};
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct BackupTask {
    pub name: String,
    pub source: String,
    pub destination: String,
}

#[tauri::command]
pub fn backup_directory(source: String, destination: String, task_name: String, app_handle: tauri::AppHandle) -> Result<String, String> {
    let source_path = Path::new(&source);
    let dest_path = Path::new(&destination);

    if !source_path.exists() {
        return Err(format!("Исходная директория {} не существует", source));
    }

    if !dest_path.exists() {
        if let Err(e) = fs::create_dir_all(dest_path) {
            return Err(format!("Не удалось создать целевую директорию {}: {}", destination, e));
        }
    }

    let total_files = count_files(&source_path)?;
    let mut copied_files = 0;

    copy_directory(&source_path, &dest_path, &mut copied_files, total_files, &task_name, &app_handle)?;

    Ok(format!("Задача '{}' успешно выполнена: скопировано {} файлов", task_name, copied_files))
}

fn count_files(dir: &Path) -> Result<usize, String> {
    let mut count = 0;
    for entry in fs::read_dir(dir).map_err(|e| e.to_string())? {
        let path = entry.map_err(|e| e.to_string())?.path();
        if path.is_dir() {
            count += count_files(&path)?;
        } else {
            count += 1;
        }
    }
    Ok(count)
}

fn copy_directory(
    src: &Path,
    dst: &Path,
    copied_files: &mut usize,
    total_files: usize,
    task_name: &str,
    app_handle: &tauri::AppHandle,
) -> Result<(), String> {
    for entry in fs::read_dir(src).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let src_path = entry.path();
        let dst_path = dst.join(src_path.file_name().ok_or("Недопустимое имя файла")?);

        if src_path.is_dir() {
            if !dst_path.exists() {
                fs::create_dir_all(&dst_path).map_err(|e| e.to_string())?;
            }
            copy_directory(&src_path, &dst_path, copied_files, total_files, task_name, app_handle)?;
        } else {
            fs::copy(&src_path, &dst_path).map_err(|e| e.to_string())?;
            *copied_files += 1;
            let progress = (*copied_files as f64 / total_files as f64 * 100.0) as i32;

            app_handle
                .emit("backup_progress", (task_name, *copied_files, total_files, progress))
                .map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

fn get_db_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let config_dir = app_handle.path().app_config_dir().map_err(|e| format!("Не удалось получить папку конфигурации: {}", e))?;
    let db_path = config_dir.join("tasks.db");
    println!("Путь к tasks.db: {:?}", db_path); 
    if let Some(parent) = db_path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Не удалось создать папку конфигурации: {}", e))?;
    }
    Ok(db_path)
}

fn init_db(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            source TEXT NOT NULL,
            destination TEXT NOT NULL
        )",
        [],
    )
    .map_err(|e| format!("Ошибка создания таблицы: {}", e))?;
    Ok(())
}

#[tauri::command]
pub fn save_tasks(tasks: Vec<BackupTask>, app_handle: tauri::AppHandle) -> Result<(), String> {
    let db_path = get_db_path(&app_handle)?;
    let conn = Connection::open(&db_path).map_err(|e| format!("Ошибка открытия базы данных: {}", e))?;

    init_db(&conn)?;

    conn.execute("DELETE FROM tasks", [])
        .map_err(|e| format!("Ошибка очистки таблицы: {}", e))?;

    for task in tasks {
        conn.execute(
            "INSERT INTO tasks (name, source, destination) VALUES (?1, ?2, ?3)",
            params![task.name, task.source, task.destination],
        )
        .map_err(|e| format!("Ошибка вставки задачи '{}': {}", task.name, e))?;
    }

    Ok(())
}

#[tauri::command]
pub fn load_tasks(app_handle: tauri::AppHandle) -> Result<Vec<BackupTask>, String> {
    let db_path = get_db_path(&app_handle)?;
    let conn = Connection::open(&db_path).map_err(|e| format!("Ошибка открытия базы данных: {}", e))?;

    init_db(&conn)?;

    let mut stmt = conn
        .prepare("SELECT name, source, destination FROM tasks")
        .map_err(|e| format!("Ошибка подготовки запроса: {}", e))?;

    let tasks = stmt
        .query_map([], |row| {
            Ok(BackupTask {
                name: row.get(0)?,
                source: row.get(1)?,
                destination: row.get(2)?,
            })
        })
        .map_err(|e| format!("Ошибка чтения задач: {}", e))?
        .collect::<Result<Vec<BackupTask>, _>>()
        .map_err(|e| format!("Ошибка обработки результата: {}", e))?;

    Ok(tasks)
}