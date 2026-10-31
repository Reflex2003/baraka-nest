"use client";

import { createContext, useContext, useState } from "react";

export type Language = "English" | "Swahili" | "Sheng";

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

function getSavedLanguage(): Language {
  if (typeof window === "undefined") {
    return "English";
  }

  const savedLanguage = localStorage.getItem("baraka-language");

  if (
    savedLanguage === "English" ||
    savedLanguage === "Swahili" ||
    savedLanguage === "Sheng"
  ) {
    return savedLanguage;
  }

  return "English";
}

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState<Language>(getSavedLanguage);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem("baraka-language", newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside a LanguageProvider"
    );
  }

  return context;
}