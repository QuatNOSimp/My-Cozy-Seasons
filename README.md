# My Cozy Seasons

Game mô phỏng cuộc sống nông trại phong cách pixel-art, chạy hoàn toàn trên trình duyệt. Bạn chuyển về căn nhà nhỏ ở làng Willowbrook, chăm sóc thú cưng, làm vườn, câu cá, nấu ăn và sống qua đủ bốn mùa: xuân, hạ, một mùa thu vàng dài và đông.

- **Công nghệ:** HTML + CSS + JavaScript thuần (ES Modules) và [Phaser 3.80.1](https://phaser.io/) (tải từ CDN jsDelivr). Không cần build, không cần Node.
- **Đồ họa và âm thanh:** toàn bộ hình ảnh được **vẽ bằng code** khi khởi động (Canvas/Phaser Graphics), âm thanh được **tổng hợp bằng WebAudio**. Dự án không có file ảnh hay âm thanh nào.
- **Lưu game:** `localStorage` của trình duyệt, khóa `mcs_save_v1`.
- **Giấy phép:** MIT.

---

## Mục lục

1. [Cách chạy](#1-cách-chạy)
2. [Cấu trúc dự án và vai trò từng file](#2-cấu-trúc-dự-án-và-vai-trò-từng-file)
3. [Kiến trúc và luồng hoạt động](#3-kiến-trúc-và-luồng-hoạt-động)
4. [Hướng dẫn chơi chi tiết](#4-hướng-dẫn-chơi-chi-tiết)
5. [Bảng dữ liệu tham khảo](#5-bảng-dữ-liệu-tham-khảo)
6. [Tính năng chưa hoàn thiện](#6-tính-năng-chưa-hoàn-thiện-ghi-chú-cho-lập-trình-viên)
7. [Xử lý sự cố](#7-xử-lý-sự-cố)

---

## 1. Cách chạy

Game dùng ES Modules nên **không thể mở trực tiếp file `index.html`** (giao thức `file://`). Hãy chạy một web server tĩnh trong thư mục dự án:

```bash
python -m http.server 8000
# hoặc
npx serve
```

Sau đó mở `http://localhost:8000`. Máy cần có Internet ở lần đầu để tải Phaser và font Nunito từ CDN.

---

## 2. Cấu trúc dự án và vai trò từng file

```
My-Cozy-Seasons/
├── index.html
├── README.md
├── LICENSE
├── css/
├── js/
│   ├── main.js, config.js, state.js, GameEvents.js, SoundFX.js
│   ├── scenes/    (các màn hình)
│   ├── systems/   (logic game)
│   ├── entities/  (nhân vật, thú cưng)
│   ├── data/      (dữ liệu cây, cá, nhiệm vụ...)
│   ├── art/       (vẽ texture bằng code)
│   ├── ui/        (giao diện HTML phủ lên canvas)
│   └── utils/     (tiện ích dùng chung)
```

### 2.1. Gốc dự án và CSS

| File                 | Vai trò                                                                                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.html`         | Trang duy nhất. Nạp font Nunito, 4 file CSS, Phaser (CDN) và `js/main.js`. Có hai vùng: `#game-container` (canvas Phaser) và `#ui-root` (giao diện HTML phủ lên trên canvas). |
| `css/main.css`       | Biến màu (bảng màu kem, xanh sage, cam đào...), reset, bố cục toàn trang, căn giữa canvas, lớp `#ui-root`.                                                                    |
| `css/hud.css`        | Giao diện trong game: chip ngày/giờ/thời tiết, vàng, cấp độ + thanh XP, 4 nút góc phải, ô đồ đang cầm, thông báo toast, banner.                                               |
| `css/ui.css`         | Panel, overlay, nút bấm, tab, lưới túi đồ, thanh chỉ số thú cưng, hàng cửa hàng/công thức, ô nhập tên, công tắc âm thanh.                                                     |
| `css/animations.css` | Các hiệu ứng `@keyframes`: fadeUp, fadeIn, popIn, toast, banner, floaty, wiggle.                                                                                              |

### 2.2. Khởi động và nền tảng (`js/`)

| File            | Vai trò                                                                                                                                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main.js`       | Điểm vào. Cài lớp tương thích màu, tạo `Phaser.Game` (1120×680, chế độ FIT, vật lý Arcade) và đăng ký các scene: Boot, Menu, Game, House.                                                                                                                                       |
| `config.js`     | Hằng số toàn cục (kích thước, tile 48px, bản đồ 34×24 ô, tốc độ đi/chạy, bán kính tương tác, tốc độ thời gian, cấp mở nhà kính), hàm tiện ích (`clamp`, `lerp`, `dist`, bộ sinh số ngẫu nhiên theo seed) và `LAYOUT` (vị trí nhà, vườn, hồ, chuồng thú, hàng rào, cây, lối đi). |
| `state.js`      | `GameState` (toàn bộ trạng thái đang chơi), `addGold`, `addXP` (tự lên cấp), công thức XP cần để lên cấp và `newGamePayload()` (đồ khởi đầu của ván mới).                                                                                                                       |
| `GameEvents.js` | Event bus trung tâm và danh sách sự kiện (`EVT.*`). Các hệ thống giao tiếp qua đây thay vì gọi trực tiếp nhau.                                                                                                                                                                  |
| `SoundFX.js`    | Âm thanh WebAudio: blip, pop, trồng cây, thu hoạch, hoàn thành nhiệm vụ, lên cấp, tiếng mèo gừ gừ, tiếng mưa...                                                                                                                                                                 |

### 2.3. Scenes (`js/scenes/`)

| File            | Vai trò                                                                                                                                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BootScene.js`  | Màn hình "Đang vẽ khu vườn...". Gọi toàn bộ hàm sinh texture, tạo icon HUD rồi chuyển sang Menu. Nếu có lỗi sẽ hiển thị ngay trên màn hình.                                                                       |
| `MenuScene.js`  | Menu chính: nền trời/đồi/nhà/cây, cánh hoa bay, nút **Tiếp tục** (nếu có save), **Chơi mới**, **Hướng dẫn**. Có màn hình tạo nhân vật (chọn Nữ/Nam, nhập tên tối đa 12 ký tự).                                    |
| `GameScene.js`  | Thế giới ngoài vườn (file lớn nhất). Dựng nền cỏ, hồ, nhà, khu thú cưng, cây, hàng rào, hộp thư, bướm, đồ nhặt, NPC, nhà kính. Xử lý phím, tương tác, đặt trang trí, ngủ, chụp ảnh, ngày/đêm và mở khóa theo cấp. |
| `HouseScene.js` | Bên trong nhà, 2 tầng. Tầng 1: phòng khách, bếp, tủ lạnh, lò sưởi, kệ sách. Tầng 2: phòng ngủ. Có sofa/ghế để ngồi, cầu thang và giường để ngủ.                                                                   |

### 2.4. Hệ thống gameplay (`js/systems/`)

Mỗi hệ thống là một đối tượng đơn lẻ có hàm `init(scene)`.

| File                   | Vai trò                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `TimeSystem.js`        | Đồng hồ trong game, 5 pha trong ngày, đổi màu ánh sáng theo giờ, tự ngủ lúc 02:00.        |
| `DaySystem.js`         | Qua ngày: cây lớn lên, thú cưng đổi chỉ số, nhiệm vụ mới, thời tiết mới, đổi mùa, tự lưu. |
| `SeasonSystem.js`      | Quản lý ngày/mùa/năm, kiểm tra cây có đúng mùa không.                                     |
| `WeatherSystem.js`     | Random nắng/mưa theo mùa, hiệu ứng mưa/tuyết và âm thanh mưa.                             |
| `LightSystem.js`       | Cột đèn đường, ánh sáng ấm ban đêm (đèn, cửa sổ nhà), đom đóm vào đêm hè.                 |
| `FarmingSystem.js`     | Ô đất: cuốc, gieo, tưới, thu hoạch, trái mùa, nhà kính, lai tạo hoa.                      |
| `InventorySystem.js`   | Thêm/bớt/đếm đồ, chọn đồ đang cầm, hàm bán đồ.                                            |
| `PetSystem.js`         | Tạo 4 thú cưng, cho ăn, vuốt ve, mở bảng chỉ số.                                          |
| `QuestSystem.js`       | Sinh nhiệm vụ hằng ngày, theo dõi tiến độ, trao thưởng.                                   |
| `AchievementSystem.js` | Đếm tiến độ thành tựu và mở khóa.                                                         |
| `FishingSystem.js`     | Mini-game câu cá (kim chạy qua lại trên thanh).                                           |
| `CookingSystem.js`     | Bảng công thức và nấu ăn.                                                                 |
| `SaveSystem.js`        | Lưu/tải/xóa save trong `localStorage`, tự lưu theo sự kiện, mỗi 45 giây và khi đóng tab.  |

### 2.5. Thực thể (`js/entities/`)

| File        | Vai trò                                                                                                              |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| `Player.js` | Nhân vật chính: di chuyển, chạy, hướng nhìn, các hành động (cuốc, tưới, thu hoạch, vuốt ve, cho ăn, nấu, ngủ, ngồi). |
| `Pet.js`    | Thú cưng với máy trạng thái (ngồi, đi dạo, ăn, ngủ, tự liếm lông, vui) và 4 chỉ số: đói, vui, sạch, năng lượng.      |
| `NPC.js`    | Khách ghé thăm: đứng chơi và đi lang thang quanh một điểm.                                                           |

### 2.6. Dữ liệu (`js/data/`)

| File              | Nội dung                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `crops.js`        | 12 loại cây: mùa, số ngày lớn, giá, XP, màu.                                              |
| `items.js`        | Công cụ, thức ăn thú, vật liệu, cá, món ăn, đồ trang trí, nguyên liệu và danh mục túi đồ. |
| `recipes.js`      | 8 công thức nấu ăn (nguyên liệu, cấp yêu cầu, XP).                                        |
| `fish.js`         | 6 loại cá (mùa, độ hiếm, độ khó, XP).                                                     |
| `quests.js`       | Kho 14 nhiệm vụ hằng ngày, mỗi ngày chọn 4.                                               |
| `achievements.js` | 11 thành tựu.                                                                             |
| `npcs.js`         | 2 NPC (Bà Mai, Ông Tư): mùa xuất hiện, lời thoại, quà.                                    |
| `pets.js`         | 4 thú cưng khởi đầu.                                                                      |
| `seasons.js`      | 4 mùa (số ngày, màu sắc, hiệu ứng, tỉ lệ mưa, đồ nhặt) và công thức hoa lai.              |

### 2.7. Đồ họa vẽ bằng code (`js/art/`)

| File                  | Vai trò                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `Textures.js`         | Texture chính: nhân vật, thú cưng, nền cỏ, đất, cây, nhà, hàng rào, hộp thư, cây trồng 5 giai đoạn, icon, hạt (particle). |
| `InteriorTextures.js` | Nội thất nhà (sàn, tường, giường, bếp, tủ lạnh...), nhà kính, icon món ăn và cá.                                          |
| `CharacterExtras.js`  | Texture NPC (Bà Mai, Ông Tư).                                                                                             |
| `LightTextures.js`    | Vầng sáng ấm, hạt đom đóm, cột đèn, bù nhìn và icon trang trí.                                                            |

### 2.8. Giao diện HTML (`js/ui/`)

| File            | Vai trò                                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `HUD.js`        | Thanh thông tin: mùa/ngày, giờ, thời tiết, vàng, cấp + XP, 4 nút (Nhiệm vụ, Túi đồ, Thành tựu, Menu), ô đồ đang cầm, toast, banner. |
| `Panels.js`     | Các bảng: nhiệm vụ, túi đồ, thành tựu, thú cưng, cửa hàng, tạm dừng.                                                                |
| `DialogueUI.js` | Hộp thoại NPC có hiệu ứng gõ chữ; nhấn E hoặc nhấp chuột để tiếp tục.                                                               |

### 2.9. Tiện ích (`js/utils/`)

Hai file này do bản vá sửa lỗi thêm vào:

| File                   | Vai trò                                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `phaserColorCompat.js` | Cho phép dùng màu dạng chuỗi `"#c99a6a"` trong `Graphics`/`Shape` của Phaser (Phaser gốc chỉ nhận số và sẽ vẽ ra màu đen). |
| `input.js`             | `onKeyDownOnce()`: chặn auto-repeat khi giữ phím để E/I/Q/P/Esc chỉ phản ứng một lần mỗi lần nhấn.                         |

---

## 3. Kiến trúc và luồng hoạt động

```
index.html ──► main.js ──► BootScene ──► MenuScene ──► GameScene  ◄──►  HouseScene
                          (vẽ texture)   (menu, tạo     (vườn)          (trong nhà)
                                          nhân vật)
```

- **Dữ liệu và logic tách nhau:** thêm cây, cá, món ăn hay nhiệm vụ chỉ cần sửa file trong `js/data/`.
- **Event bus:** hành động trong game phát sự kiện (ví dụ `crop.harvest`, `pet.feed`, `fish.catch`). `QuestSystem` và `AchievementSystem` lắng nghe để tính tiến độ.
- **Giao diện lai:** thế giới game vẽ bằng canvas Phaser, còn HUD/panel là phần tử HTML nằm trong `#ui-root` phủ lên canvas. Vì vậy `#hud` có `pointer-events: none` và từng nút được bật lại `pointer-events: auto`.
- **Trạng thái UI:** khi mở panel/hội thoại/câu cá, `GameState.uiOpen = true`. Lúc đó thời gian trong game **tạm dừng** và nhân vật không di chuyển được.
- **Lưu game:** `SaveSystem` đánh dấu "dirty" mỗi khi có thay đổi quan trọng và lưu sau khoảng 1,2 giây. Ngoài ra còn lưu mỗi 45 giây, khi qua ngày và khi đóng tab.

---

## 4. Hướng dẫn chơi chi tiết

### 4.1. Bắt đầu

1. Ở menu chính bấm **Chơi mới** (hoặc **Tiếp tục** nếu đã có save).
2. Chọn **Nữ** hoặc **Nam**, nhập tên (tối đa 12 ký tự, để trống sẽ là "Bạn"), rồi bấm **Bắt đầu cuộc sống mới**.
3. Bạn xuất hiện trước cửa nhà vào **6:30 sáng, Ngày 1, Mùa Xuân, Năm 1**.

**Đồ và tiền khởi đầu:**

| Loại        | Nội dung                                            |
| ----------- | --------------------------------------------------- |
| Vàng        | 300                                                 |
| Hạt giống   | Củ cải ×4, Hoa tulip ×2                             |
| Thức ăn thú | Cà rốt (thỏ) ×3, Xúc xích (chó) ×3, Cá khô (mèo) ×5 |
| Công cụ     | Cuốc, Bình tưới, Cần câu, Vợt bướm                  |
| Trang trí   | Chậu hoa ×1                                         |

### 4.2. Điều khiển

| Phím / chuột                 | Chức năng                                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| **W A S D** hoặc **mũi tên** | Di chuyển                                                                                               |
| **Shift** (giữ)              | Chạy                                                                                                    |
| **E**                        | Tương tác với vật gần nhất (biểu tượng E nhấp nhô phía trên vật đó); tiếp tục hội thoại; bấm khi câu cá |
| **I**                        | Mở/đóng Túi đồ                                                                                          |
| **Q**                        | Xem chỉ số thú cưng (đứng sát thú cưng)                                                                 |
| **P**                        | Chụp ảnh khu vườn (đếm ngược 3 giây rồi tải về file PNG)                                                |
| **Esc**                      | Đóng panel / hủy đặt trang trí / hủy câu cá / mở menu tạm dừng                                          |
| **Chuột**                    | Bấm các nút HUD, ô đồ đang cầm, vật phẩm trong túi, hộp thoại; đặt đồ trang trí                         |

> Mỗi lần nhấn E chỉ tương tác **một lần**. Giữ phím không làm lặp lại.

### 4.3. Giao diện trong game

- **Góc trên trái:** mùa, ngày/số ngày của mùa, năm; giờ và pha trong ngày; thời tiết.
- **Góc trên phải:** số vàng; cấp độ và thanh XP.
- **Góc dưới phải, 4 nút:** **Nhiệm vụ**, **Túi đồ**, **Thành tựu**, **Menu**.
- **Giữa dưới:** ô đồ đang cầm. Hiện "Tay không (I để chọn đồ)" khi chưa chọn gì. Bấm vào ô này cũng mở Túi đồ.
- **Thông báo:** toast nhỏ cho phần thưởng/hành động, banner lớn khi sang ngày mới, đổi mùa, lên cấp, mở khóa.

### 4.4. Thời gian, mùa và thời tiết

**Ngày và đêm**

- 1 phút trong game ≈ 0,26 giây thật. **Một ngày chơi dài khoảng 5 phút**, từ 6:30 đến 02:00 sáng hôm sau.
- Thời gian **dừng** khi bạn mở túi đồ, hội thoại, bảng nào đó hoặc đang câu cá.
- Các pha trong ngày: Sáng sớm (6:00), Trưa (11:00), Chiều (14:00), Hoàng hôn (17:00), Đêm (20:00). Màn hình đổi tông màu theo pha; trời mưa tối hơn một chút.
- Từ 17:00 đến 6:00 sáng các đèn đường, đèn vườn và cửa sổ nhà sáng lên. Đêm mùa hè có đom đóm.
- **02:00 sáng bạn tự ngủ thiếp đi** và sang ngày mới.

**Bốn mùa (31 ngày mỗi năm)**

| Mùa  | Số ngày | Khả năng mưa | Hiệu ứng     | Đồ nhặt trên đất           |
| ---- | ------- | ------------ | ------------ | -------------------------- |
| Xuân | 7       | 30%          | Cánh hoa bay | Cỏ ba lá, Bồ công anh      |
| Hạ   | 7       | 15%          | Bướm         | Vỏ ốc, Bồ công anh         |
| Thu  | 10      | 35%          | Lá rơi       | Nấm, Táo, Quả thông        |
| Đông | 7       | 25%          | Tuyết        | Quả thông, Nhánh nhựa ruồi |

Mỗi sáng thời tiết được random lại. Mùa đông thì "mưa" biến thành **tuyết**. Nhà đổi sang kiểu có tuyết phủ vào mùa đông.

**Mưa tưới giúp bạn:** ban đêm trời mưa thì mọi ô đất **ngoài trời** coi như đã được tưới (nhà kính không hưởng mưa).

### 4.5. Làm vườn (nguồn thu và XP chính của game)

**Bản đồ nông trại**

- **Vườn rau:** 12 ô ở phía đông nhà, trong khu có hàng rào.
- **Vườn hoa:** 6 ô cạnh vườn rau.
- **Nhà kính:** 4 ô ở góc đông bắc, mở khóa ở **cấp 3**.

**Quy trình trồng cây** (đứng gần ô đất rồi nhấn **E**):

1. **Cuốc đất:** ô đất trống → nhấn E để cuốc (không cần chọn cuốc).
2. **Gieo hạt:** mở **Túi đồ (I)**, bấm vào hạt giống để cầm, đứng cạnh ô đã cuốc rồi nhấn E. Nếu chưa cầm hạt, game nhắc "Chọn hạt giống trong Túi đồ (I) rồi gieo nhé!".
3. **Tưới nước:** nhấn E tại ô có cây để tưới (cần làm **mỗi ngày**, trừ khi trời mưa). Tưới rồi thì đất sậm màu.
4. **Ngủ để qua ngày:** cây chỉ lớn lên qua đêm, **và chỉ khi hôm đó nó được tưới hoặc có mưa**.
5. **Thu hoạch:** khi cây ở giai đoạn cuối (có lấp lánh) nhấn E để thu hoạch, nông sản vào túi đồ.

**Quy tắc sinh trưởng**

- Cây cần đủ số ngày `growDays` (xem [bảng cây](#51-cây-trồng)). Mỗi ngày được tưới/mưa thì tiến độ +1; quên tưới thì ngày đó không tiến thêm.
- **Trái mùa:** gieo sai mùa ở ngoài vườn vẫn được, nhưng cây lớn **chậm gấp đôi**.
- **Nhà kính:** trồng mọi cây ở mọi mùa với tốc độ bình thường, nhưng phải tự tưới (không có mưa).

**Hoa lai tạo (hoa hiếm)**

- Khi **Hướng dương** và **Cúc vạn thọ** đã **trưởng thành** nằm sát cạnh (trên/dưới/trái/phải) một ô **đã cuốc nhưng đang trống**, mỗi đêm có 40% cơ hội ô trống đó tự mọc **Hoa sao tím** (cây rất đắt giá). Khi xảy ra bạn sẽ thấy thông báo "Điều kỳ diệu: một hạt giống hoa mới nảy mầm trong vườn!".

> Thu hoạch cây **không** cộng XP trực tiếp. XP đến từ nhiệm vụ, thành tựu, nấu ăn, câu cá, nhặt đồ, bắt bướm.

### 4.6. Thú cưng

Bạn có 4 bạn đồng hành, mỗi bạn có chỗ ở riêng trong vườn:

| Tên      | Loài         | Món ưa thích | Chỗ ở (phía tây nam vườn) |
| -------- | ------------ | ------------ | ------------------------- |
| **Bông** | Thỏ trắng    | Cà rốt       | Chuồng thỏ có hàng rào    |
| **Milo** | Chó vàng nâu | Xúc xích     | Nhà chó                   |
| **Miu**  | Mèo xám      | Cá khô       | Giường mèo hồng           |
| **Mướp** | Mèo cam      | Cá khô       | Giường mèo xanh           |

**Cách chăm sóc**

- **Cho ăn:** vào Túi đồ, bấm để cầm **đúng thức ăn** của thú, đứng sát nó rồi nhấn E. Đói về 0, vui +12.
- **Vuốt ve:** không cầm thức ăn tương ứng, đứng sát thú rồi nhấn E. Vui +15. Mỗi lần vuốt phải chờ vài giây ("đang tận hưởng rồi~").
- **Xem chỉ số:** đứng sát thú và nhấn **Q**: Đói bụng, Vui vẻ, Sạch sẽ, Năng lượng.

**Chỉ số thay đổi thế nào**

- Mỗi giờ trong game: đói tăng, sạch và năng lượng giảm dần, vui giảm (giảm nhanh hơn khi đói trên 70%).
- Mỗi lần qua ngày: đói tăng thêm nhiều, năng lượng hồi đầy; nếu bé đang quá đói thì vui giảm mạnh.
- Bóng thoại trên đầu bé hiện **"!"** khi rất đói và **"~"** khi cần được sạch sẽ.
- Thú cưng **ngủ vào ban đêm** hoặc khi hết năng lượng.

> Số thức ăn có hạn (xem [mục 6](#6-tính-năng-chưa-hoàn-thiện-ghi-chú-cho-lập-trình-viên)). Hãy chia đều: thỏ và chó mỗi con 3 phần, mèo có 5 phần dùng chung.

### 4.7. Câu cá

1. Ra **hồ ở góc đông nam**, đứng cạnh điểm câu gần bến gỗ và nhấn **E** ("Câu cá"). Cần có **Cần câu**.
2. Một **thanh ngang** hiện ở cuối màn hình, kim chạy qua lại. Có một **vùng xanh**.
3. Nhấn **E đúng lúc kim nằm trong vùng xanh** để câu được cá. Nhấn trượt, cá thoát. **Esc** để hủy.
4. Cá hiếm, vùng xanh càng nhỏ và kim càng nhanh. Cá được chọn ngẫu nhiên theo mùa (xem [bảng cá](#52-cá)). Cá hiếm hiện banner "Cá hiếm!".

Câu cá cho XP và là nguyên liệu nấu ăn.

### 4.8. Bắt bướm và nhặt đồ

- **Bướm:** bay lượn trong vườn. Lại gần nhấn E để bắt (cần **Vợt bướm**). Tỉ lệ thành công 60%, trượt thì bướm bay sang chỗ khác. Mùa thu có 25% cơ hội bắt được **Bướm vua** quý hiếm.
- **Đồ nhặt:** mỗi sáng có **5 đến 7** vật phẩm theo mùa rơi rải rác ngoài vườn (không rơi trong khu nhà/vườn/hồ). Đến gần nhấn E để nhặt, +4 XP mỗi món.

### 4.9. Trong nhà

Bước tới cửa chính nhà và nhấn E ("Vào nhà"). Nhà có 2 tầng, đi lại bằng cầu thang (nhấn E tại cầu thang).

**Tầng 1: phòng khách và bếp**

| Vật               | Hành động                                                      |
| ----------------- | -------------------------------------------------------------- |
| Bếp               | Mở bảng **Nấu ăn**                                             |
| Tủ lạnh           | Cất/lấy thực phẩm (nông sản, món ăn, thức ăn, cá, nguyên liệu) |
| Lò sưởi           | Sưởi ấm (hiệu ứng)                                             |
| Kệ sách           | Đọc sách, nhận một mẹo chơi ngẫu nhiên                         |
| Sofa, ghế, bàn ăn | Ngồi nghỉ (E lần nữa để đứng dậy)                              |
| Cửa               | "Ra vườn"                                                      |
| Cầu thang         | Lên tầng 2                                                     |

**Tầng 2: phòng ngủ**

- **Giường:** "Ngủ (sang ngày mới)".
- Tủ quần áo, tủ ngăn kéo, ghế bành, cầu thang xuống tầng 1.

**Ngủ qua ngày**

- Nằm ở giường tầng 2, hoặc chọn **Ngủ** trong **Menu** (bấm nút Menu hoặc Esc), hoặc chờ tới 02:00.
- Khi sang ngày mới: cây lớn lên, thời tiết đổi, thú cưng đổi chỉ số, nhiệm vụ mới, đồ nhặt mới, hộp thư reset, **game tự lưu**. Bạn thức dậy lúc 6:30.

**Nấu ăn**

- Bảng công thức hiện nguyên liệu bạn đang có (xanh là đủ, đỏ là thiếu). Công thức chưa đủ cấp bị mờ và ghi "Mở khóa ở cấp X".
- Bấm **Nấu**: nguyên liệu bị trừ, nhân vật nấu, nhận món ăn và XP.
- Nguyên liệu phải nằm **trong Túi đồ**. Nếu đã cất vào tủ lạnh, hãy "Lấy ra" trước.
- Trong Túi đồ, cầm món ăn rồi bấm **Thưởng thức** để ăn: +6 XP.
- Xem [bảng công thức](#53-công-thức-nấu-ăn).

### 4.10. Khách ghé thăm (NPC) và hộp thư

**NPC**

| NPC        | Vai trò          | Xuất hiện mùa | Gần chỗ nào                |
| ---------- | ---------------- | ------------- | -------------------------- |
| **Bà Mai** | Người giữ vườn   | Xuân, Thu     | Đường mòn giữa vườn và nhà |
| **Ông Tư** | Lão ngư vui tính | Hạ, Đông      | Bến hồ câu cá              |

- Đến gần nhấn E để trò chuyện. Hội thoại ngắn; nhấn E hoặc bấm vào hộp thoại để tiếp.
- **Mỗi ngày mỗi NPC tặng bạn một món quà** (hạt giống, nguyên liệu, đồ nhặt tùy mùa) ở lần trò chuyện đầu tiên. Những lần sau chỉ trò chuyện.
- Trò chuyện tính cho nhiệm vụ "Trò chuyện với khách" và thành tựu "Hàng xóm thân thiện".

**Hộp thư** (gần cửa nhà)

- Nhấn E để mở, mỗi ngày **một lần**: bạn nhận một gói **hạt giống ngẫu nhiên đúng mùa hiện tại**. Nhớ mở mỗi sáng.

### 4.11. Nhiệm vụ hằng ngày

Bấm nút **Nhiệm vụ** để xem. Mỗi ngày có **4 nhiệm vụ**, đảm bảo luôn có ít nhất một nhiệm vụ **thú cưng** và một nhiệm vụ **vườn**. Hoàn thành sẽ tự nhận **vàng và XP** kèm thông báo xanh. Danh sách đổi mỗi ngày; cùng một ngày thì luôn giống nhau, kể cả khi tải lại save.

Danh sách đầy đủ ở [mục 5.5](#55-nhiệm-vụ-hằng-ngày).

### 4.12. Thành tựu

Bấm nút **Thành tựu** để xem tiến độ. Mỗi thành tựu chỉ nhận một lần, thưởng vàng và XP, kèm banner "Thành tựu mới!". Danh sách ở [mục 5.6](#56-thành-tựu).

### 4.13. Cấp độ và mở khóa

- XP cần để lên cấp tiếp theo = `90 + (cấp hiện tại − 1) × 60`. Ví dụ: cấp 1→2 cần 90 XP, 2→3 cần 150, 3→4 cần 210, 4→5 cần 270.
- **Cấp 2:** xuất hiện gợi ý ghé bếp và thử câu cá.
- **Cấp 3:** mở khóa **Nhà kính** (trồng trái mùa, 4 ô).
- **Mỗi cấp** mở khóa các công thức nấu ăn tương ứng (xem bảng công thức).
- **Cấp 5:** thành tựu "Khu vườn nở rộ".

### 4.14. Trang trí vườn

1. Mở **Túi đồ**, tab **Trang trí**, bấm vào món đồ (ví dụ Chậu hoa).
2. Một bản mờ đi theo chuột. **Nhấp chuột** vào nơi muốn đặt (đỏ nghĩa là không đặt được). **Esc** để hủy.
3. Muốn lấy lại, đứng gần món đồ và nhấn E ("Nhặt lên").
4. **Ghế gỗ** có thể ngồi (E). **Đèn vườn** và **Cột đèn** sẽ phát sáng ban đêm.

Không thể đặt trong khu nhà, hồ, vườn trồng và khu thú cưng.

### 4.15. Lưu game, chụp ảnh, menu tạm dừng

- **Tự lưu:** sau mỗi thay đổi quan trọng, mỗi 45 giây, khi qua ngày và khi đóng tab.
- **Menu** (nút Menu hoặc Esc): **Tiếp tục chơi**, **Ngủ**, bật/tắt **Âm thanh**, **Lưu game ngay**, **Về menu chính** (tự lưu trước khi thoát).
- **Chụp ảnh (P):** HUD ẩn đi, đếm ngược 3 giây, rồi trình duyệt tải về ảnh PNG có khung và dòng chữ mùa/ngày.
- Save nằm trong trình duyệt. Xóa dữ liệu trang web hoặc đổi trình duyệt/máy sẽ mất save.

### 4.16. Mẹo chơi

1. **Mỗi sáng:** mở hộp thư → xem nhiệm vụ → cho thú cưng ăn/vuốt ve → tưới cây → nhặt đồ rơi.
2. **Chọn cây theo mùa.** Mùa thu dài nhất (10 ngày), hợp để trồng cây lâu như bí ngô và ngô.
3. **Đừng quên tưới.** Một ngày bỏ tưới là cây chậm thêm một ngày. Ngày mưa thì khỏi tưới (ngoài trời).
4. **Hoa lai:** trồng hướng dương và cúc vạn thọ xen kẽ, chừa vài ô đất đã cuốc để may mắn nhận Hoa sao tím.
5. **Giữ nông sản và cá** để nấu ăn, vì các món cần nguyên liệu từ vườn và hồ.
6. **Nhiệm vụ nhanh nhất:** "Chăm sóc cả 4 thú cưng" (+80 vàng, +60 XP) chỉ cần cho ăn hoặc vuốt ve cả bốn.
7. **Kiên nhẫn với cá koi** (tỉ lệ thấp, khó): đáng giá với thành tựu +250 vàng.
8. **Cẩn thận thức ăn thú cưng**: hiện không có chỗ nào để mua thêm.

---

## 5. Bảng dữ liệu tham khảo

### 5.1. Cây trồng

| Cây            | Mùa           | Số ngày lớn | Loại    | Giá hạt | Giá bán | Độ hiếm            |
| -------------- | ------------- | ----------- | ------- | ------- | ------- | ------------------ |
| Củ cải         | Xuân          | 3           | Củ      | 20      | 45      | Thường             |
| Dâu tây        | Xuân          | 4           | Bụi     | 40      | 90      | Khá hiếm           |
| Hoa tulip      | Xuân          | 3           | Hoa     | 25      | 60      | Thường             |
| Cà chua        | Hạ            | 4           | Dây leo | 30      | 85      | Thường             |
| Ngô            | Hạ            | 5           | Cây cao | 45      | 120     | Khá hiếm           |
| Hướng dương    | Hạ            | 4           | Hoa     | 30      | 75      | Thường             |
| Bí ngô         | Thu           | 5           | Bầu bí  | 50      | 150     | Khá hiếm           |
| Cà rốt         | Thu           | 3           | Củ      | 20      | 50      | Thường             |
| Cúc vạn thọ    | Thu           | 3           | Hoa     | 25      | 65      | Thường             |
| Bắp cải        | Đông          | 4           | Rau lá  | 25      | 70      | Thường             |
| Hoa giọt tuyết | Đông          | 3           | Hoa     | 30      | 80      | Khá hiếm           |
| Hoa sao tím    | Xuân, Hạ, Thu | 5           | Hoa     | 120     | 280     | **Hiếm** (lai tạo) |

> Giá hạt/giá bán được định nghĩa trong dữ liệu nhưng cửa hàng và chức năng bán chưa được nối vào game (xem mục 6).

### 5.2. Cá

| Cá            | Mùa       | Độ hiếm  | Độ khó | XP  |
| ------------- | --------- | -------- | ------ | --- |
| Cá chép       | Cả năm    | Thường   | 0,30   | 15  |
| Cá thái dương | Xuân, Hạ  | Thường   | 0,42   | 20  |
| Cá trê        | Hạ, Thu   | Khá hiếm | 0,50   | 24  |
| Cá hồi suối   | Thu, Đông | Khá hiếm | 0,58   | 28  |
| Cá băng       | Đông      | Khá hiếm | 0,62   | 32  |
| Cá koi        | Cả năm    | **Hiếm** | 0,72   | 55  |

Độ khó càng cao thì kim chạy càng nhanh và vùng xanh càng nhỏ.

### 5.3. Công thức nấu ăn

| Món              | Nguyên liệu                 | Cấp | XP  |
| ---------------- | --------------------------- | --- | --- |
| Salad vườn       | Củ cải + Cỏ ba lá           | 1   | 22  |
| Canh rau củ      | Cà rốt + Bắp cải            | 1   | 26  |
| Bánh kếp mật ong | Bột mì + Sữa + Trứng        | 2   | 34  |
| Cá hầm rau củ    | Cá chép + Củ cải            | 2   | 38  |
| Bánh bí ngô      | Bí ngô + Bột mì + Sữa       | 3   | 48  |
| Trà hoa          | Hoa giọt tuyết + Hoa tulip  | 3   | 40  |
| Cacao nóng       | Sữa + Táo + Bột mì          | 4   | 52  |
| Lẩu cá đồng quê  | Cá hồi suối + Bắp cải + Nấm | 5   | 60  |

Nguồn bột mì, sữa, trứng: quà từ Ông Tư (xem mục 4.10).

### 5.4. Quà của NPC theo mùa

| NPC    | Xuân                             | Hạ                   | Thu                       | Đông                   |
| ------ | -------------------------------- | -------------------- | ------------------------- | ---------------------- |
| Bà Mai | Hạt dâu tây, Hạt tulip, Cỏ ba lá | (vắng mặt)           | Hạt cúc vạn thọ, Nấm, Táo | (vắng mặt)             |
| Ông Tư | (vắng mặt)                       | Trứng, Bột mì, Vỏ ốc | (vắng mặt)                | Sữa, Bột mì, Quả thông |

### 5.5. Nhiệm vụ hằng ngày

| Nhiệm vụ                      | Mục tiêu | Vàng | XP  | Nhóm        |
| ----------------------------- | -------- | ---- | --- | ----------- |
| Cho thỏ Bông ăn               | 1        | 35   | 25  | Thú cưng    |
| Cho cún Milo ăn               | 1        | 35   | 25  | Thú cưng    |
| Cho mèo ăn                    | 1        | 35   | 25  | Thú cưng    |
| Vuốt ve thú cưng 2 lần        | 2        | 30   | 20  | Thú cưng    |
| Chăm sóc cả 4 thú cưng        | 4        | 80   | 60  | Thú cưng    |
| Tưới nước cho 4 cây           | 4        | 40   | 30  | Vườn        |
| Gieo 3 hạt giống              | 3        | 40   | 30  | Vườn        |
| Thu hoạch 2 cây               | 2        | 50   | 40  | Vườn        |
| Trồng một bông hoa            | 1        | 35   | 25  | Vườn        |
| Nhặt 2 vật phẩm rơi           | 2        | 35   | 25  | Thường ngày |
| Bắt một chú bướm              | 1        | 45   | 35  | Thường ngày |
| Câu một con cá                | 1        | 55   | 40  | Thường ngày |
| Nấu một món ăn                | 1        | 50   | 38  | Thường ngày |
| Trò chuyện với khách ghé thăm | 1        | 30   | 20  | Thường ngày |

### 5.6. Thành tựu

| Thành tựu           | Điều kiện                   | Vàng | XP  |
| ------------------- | --------------------------- | ---- | --- |
| Vụ đầu tiên         | Thu hoạch cây đầu tiên      | 50   | 30  |
| Nông dân chăm chỉ   | Thu hoạch tổng cộng 10 cây  | 120  | 80  |
| Bàn tay xanh        | Gieo tổng cộng 20 hạt giống | 150  | 100 |
| Bạn của thú cưng    | Vuốt ve thú cưng 15 lần     | 120  | 80  |
| Người chăm sóc      | Cho thú cưng ăn 12 lần      | 120  | 80  |
| Cần thủ             | Câu được 5 con cá           | 150  | 90  |
| Vảy vàng may mắn    | Câu được cá koi             | 250  | 150 |
| Đầu bếp tại gia     | Nấu tổng cộng 6 món         | 150  | 90  |
| Nhà sưu tập         | Nhặt 15 vật phẩm rơi        | 100  | 70  |
| Hàng xóm thân thiện | Trò chuyện với khách 5 lần  | 80   | 60  |
| Khu vườn nở rộ      | Đạt cấp 5                   | 300  | 0   |

### 5.7. Nguồn XP

| Nguồn              | XP                         |
| ------------------ | -------------------------- |
| Nhiệm vụ hằng ngày | 20 đến 60                  |
| Thành tựu          | 30 đến 150                 |
| Nấu ăn             | 22 đến 60                  |
| Câu cá             | 15 đến 55                  |
| Bắt bướm           | 10 (thường), 25 (Bướm vua) |
| Nhặt đồ rơi        | 4                          |
| Ăn một món đã nấu  | 6                          |

---

## 6. Tính năng chưa hoàn thiện (ghi chú cho lập trình viên)

Những điểm dưới đây được rút ra từ việc đọc code. Chúng giải thích vì sao một số phần dữ liệu có sẵn nhưng chưa dùng được trong game.

| Vấn đề                       | Chi tiết                                                                                                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cửa hàng chưa được nối**   | `Panels.showShop()` đã viết đầy đủ nhưng **không có chỗ nào gọi** (chưa có quầy hàng/NPC/phím mở cửa hàng). Vì vậy hiện không mua được hạt giống, thức ăn thú, nguyên liệu, đồ trang trí. |
| **Chưa có chức năng bán đồ** | `InventorySystem.sell()` đã có nhưng chưa có giao diện gọi nó. Nông sản, cá, vật liệu hiện chỉ dùng để nấu ăn. Vàng chỉ đến từ nhiệm vụ và thành tựu.                                     |
| **Thức ăn thú cưng hữu hạn** | Hệ quả của hai mục trên: không có cách nào kiếm thêm thức ăn.                                                                                                                             |
| **Cây héo chưa hoạt động**   | Trạng thái `withered` và lệnh "Dọn cây héo" đã có, nhưng không đoạn code nào đặt `withered = true`.                                                                                       |
| **Thu hoạch không cộng XP**  | Trường `xp` trong `crops.js` chưa được dùng.                                                                                                                                              |
| **Tủ lạnh tách rời nấu ăn**  | `CookingSystem` chỉ kiểm tra Túi đồ, không đọc `GameState.fridge`, dù dòng chú thích trong bảng nấu ăn nói "hoặc Tủ lạnh".                                                                |
| **Cờ mở khóa chưa dùng**     | `GameState.unlocked.fishing / cooking / house` được lưu nhưng không được kiểm tra; ngay từ đầu bạn đã có thể câu cá, nấu ăn và vào nhà.                                                   |
| **README cũ lệch với code**  | README gốc ghi `P` = điện thoại, `M` = bản đồ, `Q` = nhiệm vụ. Thực tế: `P` = chụp ảnh, `Q` = xem thú cưng, không có phím `M`. Nhiệm vụ mở bằng nút trên HUD.                             |
| **Phụ thuộc CDN**            | Phaser và font Nunito tải từ Internet. Muốn chơi offline cần tải về và đổi đường dẫn trong `index.html`.                                                                                  |

---

## 7. Xử lý sự cố

| Triệu chứng                           | Nguyên nhân và cách xử lý                                                                                                                                                                                                                     |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trang trắng hoặc lỗi module           | Mở bằng `file://`. Hãy chạy qua web server (mục 1).                                                                                                                                                                                           |
| Nhà, cây, nhân vật **toàn màu đen**   | Màu dạng chuỗi `"#rrggbb"` bị Phaser hiểu thành đen. Đã được xử lý bởi `js/utils/phaserColorCompat.js` và gọi `installColorCompat()` trong `main.js`. Nếu tự thêm code vẽ mới, có thể dùng màu số `0xrrggbb` hoặc chuỗi `"#rrggbb"` đều được. |
| **Không bấm được** các nút HUD        | `#hud` có `pointer-events: none`; mọi nút trong HUD phải được bật lại `pointer-events: auto` (đã có cho `.hud-btn` và `.toolbar-slot`). Nếu vừa cập nhật code mà vẫn bị, hãy **tải lại cứng (Ctrl+Shift+R)** để bỏ cache CSS.                 |
| Nhấn E **lặp liên tục**               | Phaser phát sự kiện phím lặp khi giữ phím. Đã chặn bằng `onKeyDownOnce()` trong `js/utils/input.js`.                                                                                                                                          |
| Vào nhà báo lỗi "Scene key not found" | Cần đăng ký `HouseScene` trong danh sách scene ở `main.js` (đã sửa).                                                                                                                                                                          |
| Mất save                              | Save nằm trong `localStorage` của trình duyệt; xóa dữ liệu duyệt web hoặc dùng chế độ ẩn danh sẽ không giữ được save.                                                                                                                         |

---

## Giấy phép

[MIT](LICENSE), bản quyền (c) 2026 QuatNOSimp.
