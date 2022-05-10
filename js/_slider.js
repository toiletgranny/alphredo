export function update(item) {
  const sliderValue = (item.value-item.min)/(item.max-item.min)*100;
  item.style.background = 'linear-gradient(to right, #205fdc 0%, #205fdc ' + sliderValue + '%, #0519691a ' + sliderValue + '%, #0519691a 100%)';
  item.nextElementSibling.childNodes[3].value = item.value
}