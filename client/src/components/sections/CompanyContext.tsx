"use client";

import React, { createContext, useContext, useState } from "react";

export type CompanyId = "default" | "techzora" | "brandify" | "scrumspace" | "ajuedsolution";

interface CompanyContextType {
  activeCompany: CompanyId;
  setActiveCompany: (id: CompanyId) => void;
}

const CompanyContext = createContext<CompanyContextType>({
  activeCompany: "ajuedsolution",
  setActiveCompany: () => {},
});

export const CompanyProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeCompany, setActiveCompany] = useState<CompanyId>("ajuedsolution");
  return (
    <CompanyContext.Provider value={{ activeCompany, setActiveCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);