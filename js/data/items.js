import { CROPS } from "./crops.js";

export const ITEMS = {
  hoe: {
    name: "Cuốc",
    category: "tools",
    price: 0,
    desc: "Cuốc đất trồng cây",
  },
  can: {
    name: "Bình tưới",
    category: "tools",
    price: 0,
    desc: "Tưới nước cho cây",
  },
  rod: {
    name: "Cần câu",
    category: "tools",
    price: 0,
    desc: "Câu cá ở hồ sau nhà",
  },
  net: {
    name: "Vợt bướm",
    category: "tools",
    price: 0,
    desc: "Bắt bướm và côn trùng",
  },
  food_rabbit: {
    name: "Cà rốt",
    category: "food",
    price: 12,
    sell: 4,
    desc: "Món khoái khẩu của thỏ",
  },
  food_dog: {
    name: "Xúc xích",
    category: "food",
    price: 15,
    sell: 5,
    desc: "Cún Milo mê tít",
  },
  food_cat: {
    name: "Cá khô",
    category: "food",
    price: 14,
    sell: 5,
    desc: "Thức ăn cho mèo",
  },
  clover: {
    name: "Cỏ ba lá",
    category: "materials",
    sell: 8,
    desc: "Biểu tượng may mắn mùa xuân",
  },
  dandelion: {
    name: "Bồ công anh",
    category: "materials",
    sell: 6,
    desc: "Thổi một điều ước!",
  },
  shell: {
    name: "Vỏ ốc",
    category: "materials",
    sell: 10,
    desc: "Ánh xà cừ lấp lánh",
  },
  mushroom: {
    name: "Nấm",
    category: "materials",
    sell: 14,
    desc: "Nấm rừng mùa thu",
  },
  apple: {
    name: "Táo",
    category: "materials",
    sell: 12,
    desc: "Táo rụng dưới gốc cây",
  },
  pinecone: {
    name: "Quả thông",
    category: "materials",
    sell: 9,
    desc: "Vật trang trí mùa đông",
  },
  holly: {
    name: "Nhánh nhựa ruồi",
    category: "materials",
    sell: 16,
    desc: "Quả đỏ mọng mùa lễ hội",
  },
  bug_common: {
    name: "Bướm cỏ",
    category: "materials",
    sell: 15,
    desc: "Chú bướm nhỏ xinh",
  },
  bug_rare: {
    name: "Bướm vua",
    category: "materials",
    sell: 60,
    desc: "Loài bướm quý hiếm!",
  },
  fish_carp: {
    name: "Cá chép",
    category: "fish",
    sell: 35,
    desc: "Chú cá hiền lành",
  },
  fish_sun: {
    name: "Cá thái dương",
    category: "fish",
    sell: 55,
    desc: "Vảy lấp lánh như nắng",
  },
  fish_catfish: {
    name: "Cá trê",
    category: "fish",
    sell: 65,
    desc: "Béo tròn khỏe mạnh",
  },
  fish_trout: {
    name: "Cá hồi suối",
    category: "fish",
    sell: 80,
    desc: "Đặc sản mùa lạnh",
  },
  fish_ice: {
    name: "Cá băng",
    category: "fish",
    sell: 95,
    desc: "Trong vắt như pha lê",
  },
  fish_koi: {
    name: "Cá koi",
    category: "fish",
    sell: 200,
    desc: "Điềm may hiếm có!",
  },
  dish_salad: {
    name: "Salad vườn",
    category: "food",
    sell: 60,
    desc: "Giòn mát từ rau nhà trồng",
    use: "dish",
  },
  dish_soup: {
    name: "Canh rau củ",
    category: "food",
    sell: 75,
    desc: "Ấm bụng ngày se lạnh",
    use: "dish",
  },
  dish_pancake: {
    name: "Bánh kếp mật ong",
    category: "food",
    sell: 95,
    desc: "Mềm thơm, ngọt dịu",
    use: "dish",
  },
  dish_stew: {
    name: "Cá hầm rau củ",
    category: "food",
    sell: 120,
    desc: "Đậm đà hương đồng quê",
    use: "dish",
  },
  dish_pie: {
    name: "Bánh bí ngô",
    category: "food",
    sell: 150,
    desc: "Hương vị mùa thu trọn vẹn",
    use: "dish",
  },
  dish_tea: {
    name: "Trà hoa",
    category: "food",
    sell: 110,
    desc: "Thơm ngát, thư giãn",
    use: "dish",
  },
  dish_cocoa: {
    name: "Cacao nóng",
    category: "food",
    sell: 130,
    desc: "Ấm áp giữa ngày đông giá",
    use: "dish",
  },
  dish_nabe: {
    name: "Lẩu cá đồng quê",
    category: "food",
    sell: 180,
    desc: "Ngọt thanh từ cá tươi mới câu",
    use: "dish",
  },
  flower_pot: {
    name: "Chậu hoa",
    category: "decor",
    price: 40,
    sell: 15,
    desc: "Chậu hoa nhỏ xinh",
  },
  lantern: {
    name: "Đèn vườn",
    category: "decor",
    price: 60,
    sell: 22,
    desc: "Toả sáng dịu nhẹ ban đêm",
  },
  gnome: {
    name: "Tượng lùn",
    category: "decor",
    price: 80,
    sell: 30,
    desc: "Thần giữ vườn vui tính",
  },
  bench: {
    name: "Ghế gỗ",
    category: "decor",
    price: 100,
    sell: 38,
    desc: "Ngồi nghỉ ngắm vườn (E)",
  },
  lamp_post: {
    name: "Cột đèn",
    category: "decor",
    price: 120,
    sell: 45,
    desc: "Thắp sáng lối đi ban đêm",
  },
  scarecrow: {
    name: "Bù nhìn",
    category: "decor",
    price: 90,
    sell: 34,
    desc: "Canh giữ khu vườn",
  },
  flour: {
    name: "Bột mì",
    category: "misc",
    price: 18,
    sell: 6,
    desc: "Nguyên liệu nấu ăn",
  },
  milk: {
    name: "Sữa",
    category: "misc",
    price: 16,
    sell: 5,
    desc: "Nguyên liệu nấu ăn",
  },
  egg: {
    name: "Trứng",
    category: "misc",
    price: 14,
    sell: 5,
    desc: "Nguyên liệu nấu ăn",
  },
};

export const itemById = (id) => ITEMS[id];
export const CATEGORIES = [
  "all",
  "tools",
  "seeds",
  "crops",
  "food",
  "materials",
  "decor",
  "misc",
];
export const CAT_NAME = {
  all: "Tất cả",
  tools: "Công cụ",
  seeds: "Hạt giống",
  crops: "Nông sản",
  food: "Thức ăn",
  materials: "Vật liệu",
  decor: "Trang trí",
  misc: "Khác",
};

export function itemName(id) {
  if (!id) return "";
  if (id.startsWith("seed_")) {
    const c = CROPS[id.slice(5)];
    return c ? `${c.name} (hạt giống)` : id;
  }
  if (id.startsWith("crop_")) {
    const c = CROPS[id.slice(5)];
    return c ? c.name : id;
  }
  return ITEMS[id]?.name || id;
}
