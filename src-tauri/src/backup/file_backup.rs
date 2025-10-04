use tokio::fs;
use tauri::Emitter;
use std::path::{Path, PathBuf};
use std::collections::VecDeque;

#[tauri::command]
pub async fn backup_directory(
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
        fs::create_dir_all(dest_path)
            .await
            .map_err(|e| format!("Не удалось создать целевую директорию {}: {}", destination, e))?;
    }

    let total_files = count_files(source_path.to_path_buf()).await?;
    let mut copied_files = 0;

    copy_directory(
        source_path.to_path_buf(),
        dest_path.to_path_buf(),
        &mut copied_files,
        total_files,
        &task_name,
        &app_handle,
    )
    .await?;

    Ok(format!(
        "Задача '{}' успешно выполнена: файлов скопировано: {}",
        task_name,
        copied_files
    ))
}

async fn count_files(dir: PathBuf) -> Result<usize, String> {
    let mut count = 0;
    let mut queue = VecDeque::new();
    queue.push_back(dir);

    while let Some(current_dir) = queue.pop_front() {
        let mut entries = fs::read_dir(&current_dir)
            .await
            .map_err(|e| e.to_string())?;
        while let Some(entry) = entries.next_entry().await.map_err(|e| e.to_string())? {
            let path = entry.path();
            if path.is_dir() {
                queue.push_back(path); // Передаём PathBuf по значению
            } else {
                count += 1;
            }
        }
    }
    Ok(count)
}

async fn copy_directory(
    src: PathBuf,
    dst: PathBuf,
    copied_files: &mut usize,
    total_files: usize,
    task_name: &str,
    app_handle: &tauri::AppHandle,
) -> Result<(), String> {
    let mut queue = VecDeque::new();
    queue.push_back((src, dst));

    while let Some((current_src, current_dst)) = queue.pop_front() {
        let mut entries = fs::read_dir(&current_src)
            .await
            .map_err(|e| e.to_string())?;
        while let Some(entry) = entries.next_entry().await.map_err(|e| e.to_string())? {
            let src_path = entry.path();
            let dst_path = current_dst.join(src_path.file_name().ok_or("Недопустимое имя файла")?);

            if src_path.is_dir() {
                if !dst_path.exists() {
                    fs::create_dir_all(&dst_path)
                        .await
                        .map_err(|e| e.to_string())?;
                }
                queue.push_back((src_path, dst_path)); // Передаём PathBuf по значению
            } else {
                fs::copy(&src_path, &dst_path)
                    .await
                    .map_err(|e| e.to_string())?;
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
    }
    Ok(())
}