const hover = document.querySelectorAll("button");
for (const button of hover) {
  button.addEventListener("touchstart", handleMobileHover);
  button.addEventListener("touchend", handleMobileHover);
}

function handleMobileHover(e: TouchEvent) {
  e.preventDefault();
  const target = e.currentTarget as HTMLElement;
  target.classList.toggle("hover");
}
