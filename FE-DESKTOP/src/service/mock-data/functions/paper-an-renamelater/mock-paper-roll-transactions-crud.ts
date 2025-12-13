import paperRollTransactions from "../../mock-paper-roll-transactions.json";

export const mockPaperRollTransactionsQuery = async ({ } : {}) => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return { data: { paperRollTransactions } };
};
