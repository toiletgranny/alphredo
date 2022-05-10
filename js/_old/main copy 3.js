"use strict";

import * as Calc from "./_calculations.js";
import * as Toast from "./_toast.js";

const palette = {
	user: {},
	initial: {
		settings: {
			background: "white",
			saturation: {
				mode: "default",
				intensity: 1,
				offset: 0,
				easing: "easeOutQuart",
			},
		},
		colors: [
			{
				hex: "#0C0E19",
				alphaHsl: null,
				id: null
			},
			{
				hex: "#1C2035",
				alphaHsl: null,
				id: null
			},
			{
				hex: "#303651",
				alphaHsl: null,
				id: null
			},
			{
				hex: "#4A516D",
				alphaHsl: null,
				id: null
			},
			{
				hex: "#697089",
				alphaHsl: null,
				id: null
			},
			{
				hex: "#989EB3",
				alphaHsl: null,
				id: null
			},
			{
				hex: "#C7CBD8",
				alphaHsl: null,
				id: null
			},
			{
				hex: "#E6E8F0",
				alphaHsl: null,
				id: null
			},
			{
				hex: "#F4F6F9",
				alphaHsl: null,
				id: null
			},
		],
	},
	load: () => {
		return JSON.parse(localStorage.getItem("palette"));
	},
	save: () => {
    return localStorage.setItem("palette", JSON.stringify(palette.user));
  },
	delete: () => {
		palette.user = {};
		return localStorage.removeItem("palette");
	},
	calculate: () => {
		for (let i = 0; i < palette.user.colors.length; i++) {
			let saturationStrength = 0;
			if (palette.user.settings.saturation.mode === "custom") {
				const multiplier = i / palette.user.colors.length;
				saturationStrength = Calc.lerp(
					1,
					Calc.clamp(Calc.easingFunctions[palette.user.settings.saturation.easing](multiplier)+palette.user.settings.saturation.offset/10,0,1),
					palette.user.settings.saturation.intensity
				);
			} else {
				saturationStrength = 1;
			}
			palette.user.colors[i].alphaHsl = Calc.getAlphaColor(
				palette.user.colors[i].hex,
				palette.user.settings.background,
				saturationStrength
			);
			if (!palette.user.colors[i].id) {
				palette.user.colors[i].id = Math.random().toString(36).substr(2, 6);
			}
		}
		console.log(palette.user);
		return palette.user;
	},
	color: {
		remove: (i) => {
			palette.user.colors.splice(i, 1);
			return palette.save();
		},
		add: (hex) => {
			palette.user.colors.push({'hex': hex});
			return palette.save();
		},
		update: (hex, i) => {
			palette.user.colors[i].hex = hex;
			return palette.save();
		}
	},
};

const colorRow = (input = '', output = '', id) => {
	const outputDiv = `<div class="color-list__elem__output" style="background-color: hsla(${output.h},${output.s}%,${output.l}%,${output.a})">
											<output class="color-output ${Calc.brightnessByColor(input) > 128 ? ' color-output--invert' : ''}" aria-label="Transparent color output" onclick="copyToClipboard()" title="Copy to clipboard">
												hsla(${output.h},${palette.user.settings.saturation.mode === "custom" ? `<span class="color-output__callout">${output.s}%</span>` : `${output.s}%`},${output.l}%,<span class="color-output__callout">${output.a}</span>)
											</output>
										</div>`
	return `<li data-id="${id}" class="color-list__elem ${!input && !output ? 'color-list__elem--empty' : ''}">
						<div class="color-list__elem__input" style="background-color: ${input}">
							<input class="input" type="text" name="color-input" value="${input}" placeholder="Add color..." maxlength="7" aria-label="Color input">
						</div>
						${output ? outputDiv : ''} 
					</li>`
}

const viewport = {
	selectors: {
		viewport: '#viewport',
		colorList: '#color-list',
		colorRow: '.color-list__elem',
		colorInput: 'input[name="color-input"]'
	},
	setBackground: (color) => {
		return document.querySelector(viewport.selectors.viewport).style.backgroundColor = color;
	},
	render: () => {
		const colorListContainer = document.querySelector(viewport.selectors.colorList);

		viewport.setBackground(palette.user.settings.background)
		document.querySelector("#viewport-background-color").value = palette.user.settings.background === 'white' ? '#FFFFFF' : palette.user.settings.background === 'black' ? '#000000' : palette.user.settings.background;

		const colorList = palette.user.colors.map((color) => {
			return colorRow(color.hex, color.alphaHsl, color.id);
		});
		colorListContainer.innerHTML = colorList.join('') + colorRow();

		viewport.update();
	},
	update: () => {
		document.querySelectorAll(viewport.selectors.colorInput).forEach((input, i) => {
			const originalValue = input.value;
			input.addEventListener('change', () => {
				if (input.value === '') {
					palette.color.remove(i);
					renderDom(() => {
						document.querySelectorAll(viewport.selectors.colorInput)[i].select();
						document.querySelectorAll(viewport.selectors.colorRow)[i].classList.add('color-list__elem--move-up');
					});
				} else if (input.value.match(/^#([A-Fa-f0-9]{6})$/)) { 
					if (i - palette.user.colors.length === 0){
						palette.color.add(input.value)
						renderDom(() => {
							document.querySelectorAll(viewport.selectors.colorInput)[i+1].select();
							document.querySelectorAll(viewport.selectors.colorRow)[i+1].classList.add('color-list__elem--move-down');
						});
					} else { 
						palette.color.update(input.value, i);
						renderDom(() => {
							document.querySelectorAll(viewport.selectors.colorInput)[i+1].select();
						});
					};
				// } else if (input.value.split(",").length > 0) {
				// 	input.value.split(",").forEach(value => {
				// 		if (value.match(/^#([A-Fa-f0-9]{6})$/)) { 
				// 			palette.color.add(value)
				// 			renderDom(() => {
				// 				document.querySelectorAll(viewport.selectors.colorInput)[i+1].select();
				// 				document.querySelectorAll(viewport.selectors.colorRow)[i+1].classList.add('color-list__elem--move-down');
				// 			});
				// 		}
				// 	});
			 	} else {
					input.value = originalValue;
					input.classList.add("input--error");
					Toast.render("🙏 Only HEX values, please!");
				}
			})
		});
	}
};

const settings = {
	selectors: {
		settings: '#settings',
	},
	render: () => {
		const { user: { settings: { background, saturation} } } = palette;

		if (background === 'white' || background === 'black') {
			document.querySelector(`input[name="background-mode"][value="${background}"]`).checked = true;
			document.querySelector('#background-color').style.display = "none";
		} else {
			document.querySelector('#background-custom').checked = true;
			document.querySelector('#background-color').style.display = "inherit";
			document.querySelector('#background-color').value = background;
		}
		document.querySelector(`input[name="saturation-mode"][value="${saturation.mode}"]`).checked = true;
		document.querySelector('#saturation-adjustments').style.display = saturation.mode === "custom" ? "inherit" : "none"
		document.querySelector(`option[value="${saturation.easing}"]`).selected = true;
		document.querySelector('input[name="saturation-intensity"]').value = saturation.intensity;
		document.querySelector('input[name="saturation-offset"]').value = saturation.offset;

		document.querySelector('#settings').addEventListener("input", settings.handleUpdate);
	},
	handleUpdate: () => {
		const { user: { settings } } = palette;

		if (document.querySelector("input[name='background-mode']:checked").value === 'custom') {
			const input = document.querySelector("#background-color").value;
			if (input.match(/^#([A-Fa-f0-9]{6})$/)) {
				settings.background = input;
			} else if (input.match(/^([A-Fa-f0-9]{6})$/)) {
				settings.background = "#" + input;
			}
			document.querySelector('#background-color').style.display = "inherit";
		} else {
			settings.background = document.querySelector("input[name='background-mode']:checked").value;
		};
	
		settings.saturation.mode = document.querySelector("input[name='saturation-mode']:checked").value;
		settings.saturation.intensity = document.querySelector("input[name='saturation-intensity']").value;
		settings.saturation.offset = document.querySelector("input[name='saturation-offset']").value;
		settings.saturation.easing = document.querySelector("select[name='saturation-easing']").value;
	
		palette.save();
		renderDom();
	}

}

function renderExport() {
	const outputType = document.querySelector("input[name='export']:checked").value;
	let output;
	if (outputType === "hsla") {
		const hslaOutput = [];
			for (let i = 0; i < palette.user.colors.length; i++) {
				const hsla = palette.user.colors[i].alphaHsl;
				hslaOutput.push(`${palette.user.colors[i].hex} → hsla(${hsla.h},${hsla.s}%,${hsla.l}%,${hsla.a})`);
			}
			output = hslaOutput.join("\n");    
	} else if (outputType === "hex") {
		const hexOutput = [];
		for (let i = 0; i < palette.user.colors.length; i++) {
			const hsla = palette.user.colors[i].alphaHsl;
			hexOutput.push(palette.user.colors[i].hex + " → " + hslaToHex(hsla.h,hsla.s,hsla.l,hsla.a*100 + "%"));
		}
		output = hexOutput.join("\n");
	} else {
		output = JSON.stringify(palette.user, null, 2);
	}
	document.querySelector("#export-output").innerHTML = output;
}

function renderDom(callback, animate) {
	palette.user = palette.load() || palette.initial;
	palette.calculate();
	viewport.render();
	settings.render();
	palette.save();
	if (callback) {
		callback();
	}
	if (animate) {
		document.querySelectorAll(viewport.selectors.colorRow).forEach((row, i) => {
			row.classList.add("fadeInUp");
			row.style.animationDelay = 10*(i) + "ms";
		})
	}
}

window.onload = renderDom(undefined, true);


// Listen for changes

// settings.addEventListener("input", function() {
// 	if (document.querySelector("input[name='background-mode']:checked").value === 'custom') {
// 		const input = document.querySelector("#background-color").value;
// 		if (input.match(/^#([A-Fa-f0-9]{6})$/)) {
// 			palette.user.settings.background = input
// 		} else if (input.match(/^([A-Fa-f0-9]{6})$/)) {
// 			palette.user.settings.background = "#" + input
// 		}
// 		document.querySelector('#background-color').style.display = "inherit";
// 	} else {
// 		palette.user.settings.background = document.querySelector("input[name='background-mode']:checked").value;
// 	};

// 	palette.user.settings.saturation.mode = document.querySelector("input[name='saturation-mode']:checked").value;
// 	palette.user.settings.saturation.intensity = document.querySelector("input[name='saturation-intensity']").value;
// 	palette.user.settings.saturation.offset = document.querySelector("input[name='saturation-offset']").value;
// 	palette.user.settings.saturation.easing = document.querySelector("select[name='saturation-easing']").value;

// 	localStorage.setItem("palette", JSON.stringify(palette.user))
// 	return renderDom();
// })

// Import, Export, Reset

document.querySelector("#button-reset-dialog").addEventListener("click", () =>  {
	return document.querySelector("#reset-dialog").showModal();
})

document.querySelector("#button-reset").addEventListener("click", () => {
	palette.delete();
	resetDialog.close();
	Toast.render("✨ Starting fresh!");
	return renderDom(undefined, true);
})

document.querySelector("#button-import-dialog").addEventListener("click", () => {
	return document.querySelector("#import-dialog").showModal();
})

document.querySelector("#button-import").addEventListener("click", () => {
	const importInput = JSON.parse(document.querySelector("#import-input").value);
	localStorage.setItem("palette", JSON.stringify(importInput));
	importDialog.close();
	Toast.render("🎉 Palette imported!");
	return renderDom(undefined, true);
})

document.querySelector("#button-export-dialog").addEventListener("click", () =>  {
	renderExport()
	return document.querySelector("#export-dialog").showModal();
})

document.querySelectorAll("input[name='export']").forEach(item => {
	item.addEventListener("click", () => {
		return renderExport();
	});
})

document.querySelector('#button-clear').addEventListener("click", () => {
	palette.user.colors = [];
	palette.save();
	Toast.render("🧹 Colors removed!")
	return renderDom();
});

document.querySelector("#viewport-background-color").addEventListener("input", () => {
	viewport.setBackground(this.value);
	const resetButton = document.querySelector("#reset-viewport-button");
	resetButton.style.display = "inherit";
	resetButton.addEventListener("click", function(){
		document.querySelector("#viewport-background-color").value = palette.user.settings.background === 'white' ? '#FFFFFF' : palette.user.settings.background === 'black' ? '#000000' : palette.user.settings.background;
		viewport.setBackground(palette.user.settings.background);
		resetButton.style.display = "none";
		return;
	})
	return;
})