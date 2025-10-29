import paperWidths from "../../mock-paper-widths.json";

export const mockPaperWidthsQuery = async ({ } : {}) => {
  await new Promise((resolve) => setTimeout(resolve, 120));
  return { data: { paperWidths } };
};
