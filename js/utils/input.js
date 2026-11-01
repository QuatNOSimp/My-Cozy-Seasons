// Phaser phát sự kiện "keydown-<KEY>" cho MỖI lần OS auto-repeat khi giữ phím
// (nó chỉ lọc lặp khi phím đã được addKey()). Với phím "hành động" (E, I, Q, P, Esc)
// ta chỉ muốn phản ứng 1 lần cho mỗi lần nhấn, nếu không giữ E sẽ tương tác/mở hội thoại
// liên tục (vòng lặp vô hạn).
//
// Dùng:  onKeyDownOnce(this.input.keyboard, "E", () => this.tryInteract());
export function onKeyDownOnce(keyboard, name, handler, ctx) {
  keyboard.on(
    `keydown-${name}`,
    (event) => {
      if (event && event.repeat) return; // bỏ qua sự kiện auto-repeat
      handler.call(ctx, event);
    },
    ctx,
  );
}
