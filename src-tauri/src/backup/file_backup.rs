use std::fs;
use std::path::Path;
use tauri::Emitter;

#[tauri::command]
pub fn backup_directory(
    source: String,
    destination: String,
    task_name: String,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    let source_path = Path::new(&source);
    let dest_path = Path::new(&destination);

    if !source_path.exists() {
        return Err(format!("Исходная директория {} не существует", source));
    }

    if !dest_path.exists() {
        if let Err(e) = fs::create_dir_all(dest_path) {
            return Err(format!(
                "Не удалось создать целевую директорию {}: {}",
                destination, e
            ));
        }
    }

    let total_files = count_files(&source_path)?;
    let mut copied_files = 0;

    copy_directory(
        &source_path,
        &dest_path,
        &mut copied_files,
        total_files,
        &task_name,
        &app_handle,
    )?;

    Ok(format!(
        "Задача '{}' успешно выполнена: файлов скопировано: {} ",
        task_name, copied_files
    ))
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
            copy_directory(
                &src_path,
                &dst_path,
                copied_files,
                total_files,
                task_name,
                app_handle,
            )?;
        } else {
            fs::copy(&src_path, &dst_path).map_err(|e| e.to_string())?;
            *copied_files += 1;
            let progress = (*copied_files as f64 / total_files as f64 * 100.0) as i32;

            app_handle
                .emit(
                    "backup_progress",
                    (task_name, *copied_files, total_files, progress),
                )
                .map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}
