const inventory = [
  {
    id: 1,
    productionOrderCode: "2190/08",
    wareCode: "L5L 119*250*5MM",
  },
  {
    id: 2,
    productionOrderCode: "2783/08",
    wareCode: "VN3L 345*245*200 WX1-0202",
  },
];

// const orders = [
//   {
//     id: 1,
//     productionOrderCode: "2190/08",
//     totalQuantity: 40000,
//     status: "waiting", // running | complete | cancel
//     type: "import", //"export"
//     note: "",
//     quantityRemaining: 34600,
//     batches: [
//       {
//         batchNumber: 1,
//         date: "2025-09-25",
//         quantity: 20000,
//       },
//       {
//         batchNumber: 2,
//         date: "2025-09-26",
//         quantity: 20000,
//       },
//     ],
//   },
//   {
//     id: 2,
//     productionOrderCode: "2190/08",
//     totalQuantity: 20000,
//     status: "waiting", // running | complete | cancel
//     type: "export", //"export"
//     note: "",
//     quantityRemaining: 54600, //Tổng sô lượng trong lệnh (amount) - tống số lượng đã xuất (totalQuantity)
//     batches: [
//       {
//         batchNumber: 1,
//         date: "2025-09-25",
//         quantity: 20000,
//       },
//     ],
//   },
//   {
//     id: 3,
//     productionOrderCode: "2783/08",
//     totalQuantity: 2000,
//     status: "waiting", // running | complete | cancel
//     type: "export", //"export"
//     note: "",
//     quantityRemaining: 1458, //Tổng sô lượng trong lệnh (amount) - tống số lượng đã xuất (totalQuantity)
//     batches: [
//       {
//         batchNumber: 1,
//         date: "2025-09-25",
//         quantity: 20000,
//       },
//     ],
//   },
// ];

const importForm = [
  {
    id: 1,
    productionOrderCode: "2190/08",
    totalImportQuantity: 40000,
    status: "running", // running | complete | cancel
    note: "",
    quantityImportRemaining: 34600,
    ImportBatches: [
      {
        batchNumber: 1,
        date: "2025-09-25",
        quantity: 20000,
      },
      {
        batchNumber: 2,
        date: "2025-09-26",
        quantity: 20000,
      },
    ],
  },
];

const exportForm = [
  {
    id: 1,
    productionOrderCode: "2190/08",
    totalExportQuantity: 20000,
    status: "running", // running | complete | cancel
    note: "",
    quantityExportRemaining: 54600, //Dựa trên tổng số số lượng của lệnh - tổng số lượng đã xuất
    exportBatches: [
      {
        batchNumber: 1,
        date: "2025-09-25",
        quantity: 20000,
      },
    ],
  },
  {
    id: 2,
    productionOrderCode: "2783/08",
    totalExportQuantity: 2000,
    status: "running", // running | complete | cancel
    note: "",
    quantityExportRemaining: 1458, //Dựa trên tổng số số lượng của lệnh - tổng số lượng đã xuất
    exportBatches: [
      {
        batchNumber: 1,
        date: "2025-09-25",
        quantity: 2000,
      },
    ],
  },
];

export { exportForm, importForm, inventory };
