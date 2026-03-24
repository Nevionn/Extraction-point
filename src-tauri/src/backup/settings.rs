use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub theme: String,
}

// Получаем путь к базе через функцию из database.rs
fn get_db_path(app_handle: &AppHandle) -> Result<String, String> {
    let path = crate::backup::database::get_db_path(app_handle)
        .map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn get_settings(app_handle: AppHandle) -> Result<AppSettings, String> {
    let db_path = get_db_path(&app_handle)?;
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY,
            theme TEXT NOT NULL
        )",
        [],
    )
    .map_err(|e| e.to_string())?;

    let theme: Option<String> = conn
        .query_row("SELECT theme FROM settings LIMIT 1", [], |row| row.get(0))
        .optional()
        .map_err(|e| e.to_string())?;

    Ok(AppSettings {
        theme: theme.unwrap_or_else(|| "ametist".to_string()),
    })
}

#[tauri::command]
pub fn update_theme(app_handle: AppHandle, theme: String) -> Result<(), String> {
    let db_path = get_db_path(&app_handle)?;
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY,
            theme TEXT NOT NULL
        )",
        [],
    )
    .map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO settings (id, theme) VALUES (1, ?)
         ON CONFLICT(id) DO UPDATE SET theme = excluded.theme",
        params![theme],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}