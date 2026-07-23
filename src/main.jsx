/**
 * Frontend module: main.jsx
 *
 * Vai trò: main: thành phần nền tảng của ứng dụng React.
 * Luồng chính: Thiết lập style, provider, root render hoặc cấu hình dùng chung cho toàn bộ frontend.
 * Lưu ý bảo trì: Thay đổi tại đây có thể ảnh hưởng nhiều màn hình nên cần kiểm tra toàn bộ luồng chính.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import "./index.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "943161810018-2rgv71lf2e4oa8v8vhcirr42hh15ieva.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);