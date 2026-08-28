import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState("vi");

  useEffect(() => {
    // Lấy ngôn ngữ từ localStorage khi load trang
    const savedLocale = localStorage.getItem("locale");
    if (savedLocale && ["vi", "en"].includes(savedLocale)) {
      setLocale(savedLocale);
    }
  }, []);

  const changeLanguage = (newLocale) => {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};