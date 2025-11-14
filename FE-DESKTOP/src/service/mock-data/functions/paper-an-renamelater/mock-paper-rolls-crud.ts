import paperRolls from "../../mock-paper-rolls.json";

export const mockPaperRollsQuery = async ({ } : {}) => {
  await new Promise((resolve) => setTimeout(resolve, 200)); // simulate delay
  return { data: { paperRolls } };
};