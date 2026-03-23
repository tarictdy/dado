export function setStatus(element, message, isError = false) {
  if (!element) return;
  element.textContent = message;
  element.style.color = isError ? '#dc2626' : '#047857';
}
