export const NPCS = [
  {
    id: "mai",
    name: "Bà Mai",
    role: "Người giữ vườn",
    seasons: ["spring", "autumn"],
    spot: { tx: 10.5, ty: 13.6 },
    wanderR: 85,
    dress: true,
    palette: {
      skin: "#f2cfa8",
      hair: "#c9c0b4",
      shirt: "#7ba05b",
      apron: "#f2e4c8",
      pants: "#8a6a4a",
      boot: "#6a4a32",
    },
    gifts: {
      spring: ["seed_strawberry", "seed_tulip", "clover"],
      autumn: ["seed_marigold", "mushroom", "apple"],
    },
    lines: {
      gift: [
        "Ồ, chào con! Vườn dạo này tươi tốt quá, ta ghé xem một chút.",
        "Con đấy à! Ta vừa đi ngang, thấy hoa nhà con nở đẹp ghê.",
      ],
      chat: [
        "Nhớ tưới hoa buổi sáng sớm nhé con.",
        "Đất sau cơn mưa là mềm nhất đấy.",
        "Hoa tulip của con năm nay đẹp lắm!",
        "Mùa này mà có tách trà hoa thì tuyệt.",
      ],
    },
  },
  {
    id: "tu",
    name: "Ông Tư",
    role: "Lão ngư vui tính",
    seasons: ["summer", "winter"],
    spot: { tx: 24.6, ty: 16.8 },
    wanderR: 70,
    palette: {
      skin: "#e8b98a",
      hair: "#e8e2d8",
      shirt: "#5f8fbf",
      apron: null,
      pants: "#6a5a4a",
      boot: "#4a3a2c",
    },
    gifts: {
      summer: ["egg", "flour", "shell"],
      winter: ["milk", "flour", "pinecone"],
    },
    lines: {
      gift: [
        "Yo-hô! Cá hôm nay cắn câu dữ lắm, ta phải ghé khoe với con!",
        "Chào nhóc tì! Hôm nay hồ đầy cá, vui quá chừng.",
      ],
      chat: [
        "Muốn câu cá koi thì phải thật kiên nhẫn.",
        "Mùa này cá trê béo lắm đó con.",
        "Gió hồ mát ghê, ngồi cả ngày cũng được!",
        "Cá koi trắng đỏ là điềm may đấy.",
      ],
    },
  },
];
