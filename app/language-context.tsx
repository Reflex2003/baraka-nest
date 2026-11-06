"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";

export type Language = "English" | "Swahili" | "Sheng";

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
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
  const language = useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      window.addEventListener("baraka-language-change", callback);
      return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener("baraka-language-change", callback);
      };
    },
    getSavedLanguage,
    () => "English" as Language,
  );

  useEffect(() => {
    document.documentElement.lang =
      language === "English" ? "en" : language === "Swahili" ? "sw" : "en-KE";
  }, [language]);

  function setLanguage(newLanguage: Language) {
    localStorage.setItem("baraka-language", newLanguage);
    window.dispatchEvent(new Event("baraka-language-change"));
    document.documentElement.lang =
      newLanguage === "English" ? "en" : newLanguage === "Swahili" ? "sw" : "en-KE";
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside a LanguageProvider",
    );
  }

  return context;
}
