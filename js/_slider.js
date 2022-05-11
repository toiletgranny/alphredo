export function update(item) {
  const sliderValue = (item.value-item.min)/(item.max-item.min)*100;
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const filledColor = '#205fdc';
  const backgroundColor = isDark ? '#32343F' : '#E6E8F0';
  // item.style.background = 'linear-gradient(to right, #205fdc 0%, #205fdc ' + sliderValue + '%, #0519691a ' + sliderValue + '%, #0519691a 100%)';
  item.style.background = `linear-gradient(to right, ${filledColor} 0%, ${filledColor} ${sliderValue}%, ${backgroundColor} ${sliderValue}%, ${backgroundColor} 100%)`;
  item.nextElementSibling.childNodes[3].value = item.value
}