export function makeDraggable(element, handleSelector) {
  if (!element) return;

  let offsetX = 0, offsetY = 0, isDragging = false;

  const handle =
    (handleSelector && element.querySelector(handleSelector)) ||
    element.querySelector(".card-header") ||
    element.querySelector(".drag-handle") ||
    element;

  handle.addEventListener("mousedown", (e) => {
    const pos = window.getComputedStyle(element).position;
    if (pos !== "absolute" && pos !== "fixed") return;

    isDragging = true;
    offsetX = e.clientX - element.offsetLeft;
    offsetY = e.clientY - element.offsetTop;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    element.style.left = (e.clientX - offsetX) + "px";
    element.style.top = (e.clientY - offsetY) + "px";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}
