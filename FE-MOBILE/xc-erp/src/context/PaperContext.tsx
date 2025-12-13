import React, { createContext, useContext, useEffect, useState } from "react";
import paperRollsJson from "../mock/mock-paper-rolls.json";
import suppliersJson from "../mock/mock-paper-suppliers.json";
import typesJson from "../mock/mock-paper-types.json";
import colorsJson from "../mock/mock-paper-colors.json";

type PaperRoll = {
  paperRollId: string;
  name: string;
  paperTypeId?: string;
  weight: number;
  receivingDate?: string;
};

type PaperContextType = {
  paperRolls: PaperRoll[];
  suppliers: any[];
  types: any[];
  colors: any[];
  findByName: (name: string) => PaperRoll | undefined;
  exportRoll: (paperRollId: string) => void;
  reImportRoll: (paperRollId: string, newWeight: number) => void;
};

const PaperContext = createContext<PaperContextType | undefined>(undefined);

export const PaperProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paperRolls, setPaperRolls] = useState<PaperRoll[]>([]);
  const [suppliers] = useState<any[]>(suppliersJson as any);
  const [types] = useState<any[]>(typesJson as any);
  const [colors] = useState<any[]>(colorsJson as any);

  useEffect(() => {
    setPaperRolls(paperRollsJson as any);
  }, []);

  const findByName = (name: string) => {
    return paperRolls.find((p) => p.name === name);
  };

  const exportRoll = (paperRollId: string) => {
    setPaperRolls((prev) =>
      prev.map((p) =>
        p.paperRollId === paperRollId ? { ...p, weight: 0 } : p
      )
    );
  };

  const reImportRoll = (paperRollId: string, newWeight: number) => {
    if (newWeight < 0) return;
    setPaperRolls((prev) =>
      prev.map((p) =>
        p.paperRollId === paperRollId ? { ...p, weight: newWeight } : p
      )
    );
  };

  return (
    <PaperContext.Provider
      value={{ paperRolls, suppliers, types, colors, findByName, exportRoll, reImportRoll }}
    >
      {children}
    </PaperContext.Provider>
  );
};

export const usePaper = () => {
  const ctx = useContext(PaperContext);
  if (!ctx) throw new Error("usePaper must be used within PaperProvider");
  return ctx;
};
