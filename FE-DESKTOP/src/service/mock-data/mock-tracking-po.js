const mockDataPO = [
  {
    id: 1,
    productionOrderCode: "2190/08",
    customer: "MRS HẠNH",
    wareCode: "L5L 119*250*5MM",
    purchaseOrder: "AR-1432 P14",
    waveType: "3B",
    wareLength: 400,
    wareWidth: 590,
    amount: "3,458",
    deliveryDate: "16/09",
    orderReceivedDate: "30/08",
    blankWidth: "479",
    sheetLength: "1255",
    flap: "130",
    warePerBlank: "1.0",
    numberOfBlanks: "3458",
    numberOfSheets: "1153",
    paperLength: "1447",
    partSX: "3",
    paperWidth: "1500",
    edgeTrim: "32",
    priority: 1,
    status: "Chờ",
    bpSong: {
      "7L": "Chờ",
    },
    bpInAn: {
      maySX: "4M",
      giaCong: "In + Chạp",
      status: "Chờ",
      color1: "BK6F",
    },
    bpCheBien: {
      status: "Chạy",
      stages: [
        {
          congDoan1: {
            name: "Xả",
            status: "Hoàn Thành",
          },
        },
        {
          congDoan2: {
            name: "Chập Cầu",
            status: "Chờ",
          },
        },
        {
          congDoan3: {
            name: "Chọn điểm bó",
            status: "Đang Chạy",
          },
        },
        {
          congDoan4: null,
        },
      ],
    },
    bpGhimDan: {
      giaCong: "Dán Tđ",
      status: "Chờ",
    },
  },
  {
    id: 2,
    productionOrderCode: "2783/08",
    customer: "AROMA",
    wareCode: "VN3L 345*245*200 WX1-02O2",
    purchaseOrder: "AR-1432 P14",
    waveType: "3B",
    wareLength: 345,
    wareWidth: 980,
    amount: "2,950",
    deliveryDate: "18/09",
    orderReceivedDate: "01/09",
    blankWidth: 400,
    sheetLength: 590,
    warePerBlank: "2.0",
    numberOfBlanks: 172,
    numberOfSheets: 577,
    paperLength: 340,
    partSX: 3,
    paperWidth: 1250,
    edgeTrim: 25,
    priority: 2,
    status: "Chạy",
    bpSong: {
      "5L": "Hoàn Thành",
    },
    bpInAn: {
      maySX: "3M-A",
      giaCong: "In + Bế",
      status: "Hoàn Thành",
      color1: "BK6F",
    },
    bpCheBien: {
      status: "Chạy",
      stages: [
        {
          congDoan1: {
            name: "Xả",
            status: "Hoàn Thành",
          },
        },
        {
          congDoan2: null,
        },
        {
          congDoan3: {
            name: "Bó",
            status: "Đang Chạy",
          },
        },
        {
          congDoan4: null,
        },
      ],
    },
    bpGhimDan: {
      giaCong: "Dán Btđ",
      status: "Chạy",
    },
  },
  {
    id: 3,
    productionOrderCode: "2788/08",
    customer: "AROMA",
    wareCode: "VN3L 345*245*200 WX1-02O2",
    purchaseOrder: "AR-1432 P14",
    waveType: "5CB",
    wareLength: 345,
    wareWidth: 255,
    wareHeight: 220,
    amount: "3,458",
    deliveryDate: "20/09",
    orderReceivedDate: "30/08",
    blankWidth: 479,
    sheetLength: 1255,
    flap: 130,
    warePerBlank: "1.0",
    numberOfBlanks: 3458,
    numberOfSheets: 1153,
    paperLength: 1447,
    partSX: 3,
    paperWidth: 1500,
    edgeTrim: 32,
    priority: 3,
    status: "Hủy",
    bpSong: {
      "7L": "Hủy",
    },
    bpInAn: {
      maySX: "2M-C",
      giaCong: "In + Bế",
      status: "Hủy",
      color1: "BK6F",
    },
    bpCheBien: {
      status: "Hủy",
      stages: [
        {
          congDoan1: {
            name: "Bế Tròn",
            status: "Hoàn Thành",
          },
        },
        {
          congDoan2: {
            name: "Chập Cầu",
            status: "Hoàn Thành",
          },
        },
        {
          congDoan3: {
            name: "Nhặt lề bế",
            status: "Hoàn Thành",
          },
        },
        {
          congDoan4: {
            name: "Gài Vách 2x1",
            status: "Chờ",
          },
        },
      ],
    },
    bpGhimDan: {
      giaCong: "Dán Btđ",
      status: "Hủy",
    },
  },
  {
    id: 4,
    productionOrderCode: "2790/08",
    customer: "AROMA",
    wareCode: "H5L345*260*290 WX001",
    purchaseOrder: "AR-1432 P14",
    waveType: "5CB",
    wareLength: 355,
    wareWidth: 255,
    wareHeight: 250,
    amount: "4,120",
    deliveryDate: "22/09",
    orderReceivedDate: "02/09",
    blankWidth: 345,
    sheetLength: 980,
    warePerBlank: "4.0",
    numberOfBlanks: 865,
    numberOfSheets: 217,
    paperLength: 212,
    partSX: 4,
    paperWidth: 1400,
    edgeTrim: 10,
    priority: 3,
    status: "Hoàn Thành",
    bpSong: {
      "7L": "Hoàn Thành",
    },
    bpInAn: {
      maySX: "2M-B",
      giaCong: "In + Chạp",
      status: "Hoàn Thành",
      color1: "BK6F",
      color2: "XL44",
    },
    bpCheBien: {
      status: "Hoàn Thành",
      stages: [
        {
          congDoan1: {
            name: "Xả",
            status: "Hoàn Thành",
          },
        },
        {
          congDoan2: {
            name: "Chập Cầu",
            status: "Hoàn Thành",
          },
        },
        {
          congDoan3: {
            name: "Nhặt lề bế",
            status: "Hoàn Thành",
          },
        },
        {
          congDoan4: {
            name: "Gài Vách 1x2",
            status: "Hoàn Thành",
          },
        },
      ],
    },
    bpGhimDan: {
      giaCong: "Dán Tđ",
      status: "Hoàn Thành",
    },
  },
];

export default mockDataPO;
