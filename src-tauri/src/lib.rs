use tauri_plugin_dialog;

mod backup;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            backup::file_backup::backup_directory,
            backup::database::save_tasks,
            backup::database::load_tasks,
            backup::database::get_db_path_to_str
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
