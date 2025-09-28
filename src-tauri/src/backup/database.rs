use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
pub struct BackupTask {
    pub name: String,
    pub source: String,
    pub destination: String,
}

// Получение пути к tasks.db
pub fn get_db_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let config_dir = app_handle.path().app_config_dir().map_err(|e| {
        println!("Ошибка получения папки конфигурации: {:?}", e);
        format!("Не удалось получить папку конфигурации: {}", e)
    })?;
    let db_path = config_dir.join("tasks.db");
    println!("Путь к tasks.db: {:?}", db_path);
    if let Some(parent) = db_path.parent() {
        println!("Попытка создать папку: {:?}", parent);
        fs::create_dir_all(parent).map_err(|e| {
            println!("Ошибка создания папки {}: {:?}", parent.display(), e);
            format!("Не удалось создать папку {}: {}", parent.display(), e)
        })?;
        if parent.exists() {
            println!(
                "Папка {} успешно создана или уже существует",
                parent.display()
            );
        } else {
            println!("Папка {} НЕ создалась!", parent.display());
            return Err(format!("Папка {} не была создана", parent.display()));
        }
    }
    Ok(db_path)
}

#[tauri::command]
pub fn get_db_path_to_str(app_handle: tauri::AppHandle) -> Result<String, String> {
    get_db_path(&app_handle)
        .map(|path| path.to_string_lossy().into_owned())
        .map_err(|e| format!("Ошибка получения пути к базе данных: {}", e))
}

// Инициализация таблицы задач
fn init_db(conn: &Connection) -> Result<(), String> {
    println!("Инициализация таблицы задач");
    conn.execute(
        "CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            source TEXT NOT NULL,
            destination TEXT NOT NULL
        )",
        [],
    )
    .map_err(|e| {
        println!("Ошибка создания таблицы: {:?}", e);
        format!("Ошибка создания таблицы: {}", e)
    })?;
    println!("Таблица задач создана или уже существует");
    Ok(())
}

#[tauri::command]
pub fn save_tasks(tasks: Vec<BackupTask>, app_handle: tauri::AppHandle) -> Result<(), String> {
    println!("Сохранение задач: {:?}", tasks);
    let db_path = get_db_path(&app_handle)?;
    println!("Открываем базу данных: {:?}", db_path);
    let conn = Connection::open(&db_path).map_err(|e| {
        println!("Ошибка открытия базы данных {}: {:?}", db_path.display(), e);
        format!("Ошибка открытия базы данных {}: {}", db_path.display(), e)
    })?;

    init_db(&conn)?;

    conn.execute("DELETE FROM tasks", []).map_err(|e| {
        println!("Ошибка очистки таблицы: {:?}", e);
        format!("Ошибка очистки таблицы: {}", e)
    })?;

    for task in tasks {
        conn.execute(
            "INSERT INTO tasks (name, source, destination) VALUES (?1, ?2, ?3)",
            params![task.name, task.source, task.destination],
        )
        .map_err(|e| {
            println!("Ошибка вставки задачи '{}': {:?}", task.name, e);
            format!("Ошибка вставки задачи '{}': {}", task.name, e)
        })?;
    }
    println!("Задачи успешно сохранены");
    Ok(())
}

#[tauri::command]
pub fn load_tasks(app_handle: tauri::AppHandle) -> Result<Vec<BackupTask>, String> {
    let db_path = get_db_path(&app_handle)?;
    println!("Загрузка задач из: {:?}", db_path);
    let conn = Connection::open(&db_path).map_err(|e| {
        println!("Ошибка открытия базы данных {}: {:?}", db_path.display(), e);
        format!("Ошибка открытия базы данных {}: {}", db_path.display(), e)
    })?;

    init_db(&conn)?;

    let mut stmt = conn
        .prepare("SELECT name, source, destination FROM tasks")
        .map_err(|e| {
            println!("Ошибка подготовки запроса: {:?}", e);
            format!("Ошибка подготовки запроса: {}", e)
        })?;

    let tasks = stmt
        .query_map([], |row| {
            Ok(BackupTask {
                name: row.get(0)?,
                source: row.get(1)?,
                destination: row.get(2)?,
            })
        })
        .map_err(|e| {
            println!("Ошибка чтения задач: {:?}", e);
            format!("Ошибка чтения задач: {}", e)
        })?
        .collect::<Result<Vec<BackupTask>, _>>()
        .map_err(|e| {
            println!("Ошибка обработки результата: {:?}", e);
            format!("Ошибка обработки результата: {}", e)
        })?;

    println!("Загруженные задачи: {:?}", tasks);
    Ok(tasks)
}
