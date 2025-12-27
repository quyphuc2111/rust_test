import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("");
  const [delaySeconds, setDelaySeconds] = useState(60);
  const [forceClose, setForceClose] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleShutdown() {
    if (!target.trim()) {
      setMessage("Vui lòng nhập IP hoặc tên máy tính");
      return;
    }
    setIsLoading(true);
    try {
      const result = await invoke<string>("shutdown_remote", { 
        target: target.trim(), 
        delaySeconds,
        force: forceClose 
      });
      setMessage(result);
    } catch (error) {
      setMessage(`Lỗi: ${error}`);
    }
    setIsLoading(false);
  }

  async function handleRestart() {
    if (!target.trim()) {
      setMessage("Vui lòng nhập IP hoặc tên máy tính");
      return;
    }
    setIsLoading(true);
    try {
      const result = await invoke<string>("restart_remote", { 
        target: target.trim(), 
        delaySeconds,
        force: forceClose 
      });
      setMessage(result);
    } catch (error) {
      setMessage(`Lỗi: ${error}`);
    }
    setIsLoading(false);
  }

  async function handleCancel() {
    if (!target.trim()) {
      setMessage("Vui lòng nhập IP hoặc tên máy tính");
      return;
    }
    setIsLoading(true);
    try {
      const result = await invoke<string>("cancel_remote", { target: target.trim() });
      setMessage(result);
    } catch (error) {
      setMessage(`Lỗi: ${error}`);
    }
    setIsLoading(false);
  }

  return (
    <main className="container">
      <h1>🖥️ Remote Shutdown LAN</h1>
      <p>Tắt/khởi động lại máy tính Windows qua mạng LAN</p>

      <div className="control-panel">
        <div className="input-group">
          <label htmlFor="target">IP hoặc tên máy tính:</label>
          <input
            id="target"
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="192.168.1.100 hoặc PC-NAME"
          />
        </div>

        <div className="input-group">
          <label htmlFor="delay">Thời gian chờ (giây):</label>
          <input
            id="delay"
            type="number"
            min="0"
            max="3600"
            value={delaySeconds}
            onChange={(e) => setDelaySeconds(parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={forceClose}
              onChange={(e) => setForceClose(e.target.checked)}
            />
            Buộc đóng ứng dụng (không hỏi lưu)
          </label>
        </div>

        <div className="button-group">
          <button
            className="btn-shutdown"
            onClick={handleShutdown}
            disabled={isLoading}
          >
            ⏻ Tắt máy
          </button>
          <button
            className="btn-restart"
            onClick={handleRestart}
            disabled={isLoading}
          >
            🔄 Khởi động lại
          </button>
          <button
            className="btn-cancel"
            onClick={handleCancel}
            disabled={isLoading}
          >
            ❌ Hủy lệnh
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes("Lỗi") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      <div className="info-box">
        <h3>📋 Yêu cầu:</h3>
        <ul>
          <li>Máy đích phải bật Remote Registry service</li>
          <li>Tài khoản phải có quyền Admin trên máy đích</li>
          <li>Firewall cho phép kết nối từ xa</li>
        </ul>
      </div>
    </main>
  );
}

export default App;