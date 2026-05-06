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

export const CompanyProvider = ({ children, initialCompany = "ajuedsolution" }: { children: React.ReactNode, initialCompany?: CompanyId }) => {
  const [activeCompany, setActiveCompany] = useState<CompanyId>(initialCompany);
  return (
    <CompanyContext.Provider value={{ activeCompany, setActiveCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);