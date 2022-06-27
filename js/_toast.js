export function render(text = "Success", parentNode, duration = 300, delay = 3000) {
  document.querySelectorAll(".toast").forEach((e) => {
    e.remove()
  });
  const toastId = Math.random().toString(36).substr(2, 9);
  const toastComponent = `<div class="toast" id="${toastId}" style="animation-duration: ${duration}ms; animation-delay: ${delay}ms">${text}</div>`;
  const node = parentNode ? parentNode : document.body;
  node.insertAdjacentHTML('beforeend',toastComponent);
  setTimeout(kill, duration + delay, toastId);
}

function kill(id) {
  document.getElementById(id).remove()
}

