export function render(text = "Success", duration = 300, delay = 3000) {
  const toastId = Math.random().toString(36).substr(2, 9);
  const toastComponent = `<div class="toast" id="${toastId}" style="animation-duration: ${duration}ms; animation-delay: ${delay}ms">${text}</div>`;
  document.body.insertAdjacentHTML('afterbegin',toastComponent);
  setTimeout(kill, duration + delay, toastId);
  return;
}

function kill(id) {
  document.getElementById(id).remove()
  return;
}

