// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// ── WebView のズームレベルを設定する ────────────────────────
// scale_factor: 1.0 = 100%（等倍）
#[tauri::command]
fn set_zoom(window: tauri::WebviewWindow, scale_factor: f64) -> Result<(), String> {
    window.set_zoom(scale_factor).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![greet, set_zoom])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
