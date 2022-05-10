
	update_OLD: () => {
		const colorListItems = document.querySelectorAll(".color-list__elem:not(.color-list__elem--empty)");
		const colorInputs = document.querySelectorAll('input[name="color-input"]');
		colorInputs.forEach((input, i) => {
			const row = input.closest('.color-list__elem');
			const colorId = row.dataset.id;
			input.addEventListener("change",() => {
				if (input.value === '') {
					palette.color.remove(colorId);
					palette.calculate();
					row.remove();
					// ---
					colorListItems.forEach((row, i) => {
						row.querySelector('.color-list__elem__output').style.background = palette.user.colors[i].alphaHsl;
					});
					// ---
				}
			});
		});

	}

// -----

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const l = Math.max(r, g, b);
  const s = l - Math.min(r, g, b);
  const h = s
    ? l === r
      ? (g - b) / s
      : l === g
      ? 2 + (b - r) / s
      : 4 + (r - g) / s
    : 0;
  return [
    Math.round(60 * h < 0 ? 60 * h + 360 : 60 * h),
    Math.round(100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0)),
    Math.round((100 * (2 * l - s)) / 2),
  ];
}

function getAlphaColor(colorHex, mode = 'darken', backgroundHex, offset = 0) {

  // 0. Convert input HEXes to RGBs (arrays) and assign them to variables
  const color = hexToRgb(colorHex);

  // 1. Determine the background against which the transparency should be calculated
  let surface

  if (backgroundHex) {
    surface = hexToRgb(backgroundHex);
  }
  if (mode === 'lighten') {
    mode = 255;
    if (!backgroundHex) { surface = [0,0,0] }
  } else {
    mode = 0;
    if (!backgroundHex) { surface = [255,255,255] }
  }

  // 2. Calculate alpha per each channel and pick the highest value
  let alphaRgb = [];
  color.forEach(function (item, i) {
    alphaRgb[i] = (color[i] - surface[i]) / (mode - surface[i]);
  });
  const alpha = Math.max(...alphaRgb);

  // 3. Calculate new RGB values based on the alpha
  color.forEach(function (item, i) {
    color[i] = Math.round((color[i] - surface[i] + surface[i] * alpha) / alpha);
  });

  // 4. Convert new RGB values to HSL
  const hsl = rgbToHsl(color[0],color[1],color[2]);
  return `hsla(${hsl[0]},${hsl[1]*(1 - offset)}%,${hsl[2]}%,${Math.round((alpha + Number.EPSILON) * 100) / 100})`;
  // return `rgba(${color},${Math.round((alpha + Number.EPSILON) * 100) / 100})`;

}

// DOM

const palette = {
  'settings': {
    'mode': 'darken',
    'background': '#FFFFFF'
  },
  'colors': [
  {
    'hex': '#0C0E19',
    'alphaHsl': null
  },
  {
    'hex': '#1C2035',
    'alphaHsl': null
  },
  {
    'hex': '#303651',
    'alphaHsl': null
  },
  {
    'hex': '#4A516D',
    'alphaHsl': null
  },
  {
    'hex': '#697089',
    'alphaHsl': null
  },
  {
    'hex': '#989EB3',
    'alphaHsl': null
  },
  {
    'hex': '#C7CBD8',
    'alphaHsl': null
  },
  {
    'hex': '#E6E8F0',
    'alphaHsl': null
  },
  {
    'hex': '#F4F6F9',
    'alphaHsl': null
  }
]}
const backgroundInput = document.querySelector('input[name="background"]')
const canvas = document.querySelector('.main__section')

function renderColorRow(input = '', output = '') {
  document.querySelector('.color-list').innerHTML += `<li class="color-list__elem">
    <div class="color-list__elem__input" style="background-color: ${input}">
      <input class="input" type="text" name="inputcolor" value="${input}" placeholder="Enter HEX" maxlength="7"">
    </div>
    <div class="color-list__elem__output" style="background-color: ${output}">
      <output class="color-output" onclick="copyToClipboard()">${output}</output>
    </div>
  </li>`
}

function renderColors() {
  console.log("Rendered")
  const mode = palette.settings.mode;
  const background = palette.settings.background;
  document.querySelector('.color-list').innerHTML = '';

  for (let i = 0; i < palette.colors.length; i++) {
    const input = palette.colors[i].hex;
    const output = getAlphaColor(palette.colors[i].hex, mode, background, undefined);
    renderColorRow(input, output);
    palette.colors[i].alphaHsl = output;
  }
  renderColorRow()

  const inputColors = document.querySelectorAll('input[name="inputcolor"]');
  for (let i = 0; i < inputColors.length; i++) {
    const input = inputColors[i];
    const oldValue = input.value;
    input.addEventListener('change', event => {
      if (input.value === '') { // If the input is empty, remove that color from the array
        palette.colors.splice(i,1);
        renderColors()
      } else if (input.value.match(/^#([A-Fa-f0-9]{6})$/)) { // Check if valid hex code, otherwise ingore input; do nothing
        if (i - palette.colors.length === 0){ // If that's a new color, add it to the array
          palette.colors.push({'hex': input.value, 'alphaHsl': null});
        } else { // If that's an existing color, update it's value
          palette.colors[i].hex = input.value;
        }
        renderColors()
      } else {
        input.value = oldValue;
        input.classList.add("input--error")
      }
    })
  }
}

function updateMode() {
  const modeSwitch = document.querySelector('input[name="mode"]:checked').value;
  let mode;
  let backgroundColor;
  if (modeSwitch === 'lighten') {
    mode = 'lighten';
    backgroundColor = '#000000';
  } else {
    mode = 'darken';
    backgroundColor = '#FFFFFF';
  }
  palette.settings.mode = mode;
  palette.settings.background = canvas.style.backgroundColor = backgroundInput.value = backgroundColor;
  renderColors()
}

function consolePalette() {
  console.log(palette)
}

document.querySelectorAll('input[name="mode"]').forEach(item => {
  item.addEventListener('input', event => {
    updateMode()
  })
})

document.querySelectorAll('input[name="background-mode"]').forEach(item => {
  item.addEventListener('input', event => {
    const backgroundModeSwitch = document.querySelector('input[name="background-mode"]:checked').value;
    if (backgroundModeSwitch === 'inherit') {
      backgroundInput.style.display = 'none'
      updateMode()
    } else if (backgroundModeSwitch === 'custom') {
      backgroundInput.style.display = 'initial'
    }
  })
})

backgroundInput.addEventListener('change', event => {
  palette.settings.background = backgroundInput.value;
  canvas.style.backgroundColor = backgroundInput.value;
  renderColors()
})

renderColors()

// Experiments

function copyToClipboard() {
  // event.target.select();
  let copyText = event.target.value;
  navigator.clipboard.writeText(copyText).then(() => {
    // alert("Copied to clipboard");
  });
}

function easeOutQuart(e) {
  return 1 - Math.pow(1 - e, 4);
}

let foo = easeOutQuart(.01);

console.log(foo)
