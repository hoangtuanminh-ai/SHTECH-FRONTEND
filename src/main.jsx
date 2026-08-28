// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import 'antd/dist/reset.css';
import { AuthProvider } from "./context/AuthContext.jsx";
ReactDOM.createRoot(document.getElementById("root")).render(
   <HelmetProvider>
 <React.StrictMode>
  <AuthProvider>
    <BrowserRouter>
    <LanguageProvider>
     
      <App />
     
      </LanguageProvider>
    </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
</HelmetProvider>

);
