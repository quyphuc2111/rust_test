use std::process::Command;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Tắt máy từ xa qua LAN
#[tauri::command]
fn shutdown_remote(target: &str, delay_seconds: u32, force: bool) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        let remote = format!("\\\\{}", target);
        let mut args = vec!["/s", "/m", &remote, "/t", &delay_seconds.to_string()];
        
        if force {
            args.push("/f"); // Force close applications
        }

        let output = Command::new("shutdown")
            .args(&args)
            .output()
            .map_err(|e| format!("Không thể thực thi lệnh: {}", e))?;

        if output.status.success() {
            Ok(format!("Đã gửi lệnh tắt máy đến {} (sau {} giây)", target, delay_seconds))
        } else {
            let error = String::from_utf8_lossy(&output.stderr);
            Err(format!("Lỗi: {}", error))
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        let _ = (target, delay_seconds, force);
        Err("Chức năng này chỉ hoạt động trên Windows".to_string())
    }
}

/// Khởi động lại máy từ xa qua LAN
#[tauri::command]
fn restart_remote(target: &str, delay_seconds: u32, force: bool) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        let remote = format!("\\\\{}", target);
        let mut args = vec!["/r", "/m", &remote, "/t", &delay_seconds.to_string()];
        
        if force {
            args.push("/f");
        }

        let output = Command::new("shutdown")
            .args(&args)
            .output()
            .map_err(|e| format!("Không thể thực thi lệnh: {}", e))?;

        if output.status.success() {
            Ok(format!("Đã gửi lệnh khởi động lại đến {} (sau {} giây)", target, delay_seconds))
        } else {
            let error = String::from_utf8_lossy(&output.stderr);
            Err(format!("Lỗi: {}", error))
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        let _ = (target, delay_seconds, force);
        Err("Chức năng này chỉ hoạt động trên Windows".to_string())
    }
}

/// Hủy lệnh tắt máy từ xa
#[tauri::command]
fn cancel_remote(target: &str) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        let remote = format!("\\\\{}", target);
        let output = Command::new("shutdown")
            .args(["/a", "/m", &remote])
            .output()
            .map_err(|e| format!("Không thể hủy: {}", e))?;

        if output.status.success() {
            Ok(format!("Đã hủy lệnh tắt máy trên {}", target))
        } else {
            let error = String::from_utf8_lossy(&output.stderr);
            Err(format!("Lỗi: {}", error))
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        let _ = target;
        Err("Chức năng này chỉ hoạt động trên Windows".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, shutdown_remote, restart_remote, cancel_remote])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
