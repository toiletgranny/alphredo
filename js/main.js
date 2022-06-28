"use strict";

import * as Calc from "./_calculations.js";
import * as Toast from "./_toast.js";
import * as Slider from "./_slider.js";
import * as Input from "./_input.js";

const palette = {
	user: {},
	initial: {
		settings: {
			background: "white",
			saturation: {
				mode: "default",
				intensity: 1,
				offset: 0,
				gradation: "easeOutQuart",
			},
		},
		colors: [
			{
				hex: "#0C0E19",
				alphaHsl: null,
			},
			{
				hex: "#1C2035",
				alphaHsl: null,
			},
			{
				hex: "#303651",
				alphaHsl: null,
			},
			{
				hex: "#4A516D",
				alphaHsl: null,
			},
			{
				hex: "#697089",
				alphaHsl: null,
			},
			{
				hex: "#989EB3",
				alphaHsl: null,
			},
			{
				hex: "#C7CBD8",
				alphaHsl: null,
			},
			{
				hex: "#E6E8F0",
				alphaHsl: null,
			},
			{
				hex: "#F4F6F9",
				alphaHsl: null,
			},
		],
	},
	load: () => {
		return JSON.parse(localStorage.getItem("palette"));
	},
	save: () => {
		return localStorage.setItem("palette", JSON.stringify(palette.user));
	},
	remove: () => {
		palette.user = {};
		return localStorage.removeItem("palette");
	},
	calculate: () => {
		const { user: { settings, colors } } = palette;
		for (let i = 0; i < colors.length; i++) {
			let saturationStrength = 0;
			if (settings.saturation.mode === "custom") {
				const multiplier = i / colors.length;
				saturationStrength = Calc.lerp(
					1,
					Calc.clamp(Calc.easingFunctions[settings.saturation.gradation](multiplier) + (settings.saturation.offset * 10) / 10, 0, 1),settings.saturation.intensity);
				} else {
					saturationStrength = 1;
				}
				colors[i].alphaHsl = Calc.getAlphaColor(colors[i].hex, settings.background, saturationStrength);
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
			palette.user.colors.push({ hex: hex });
			return palette.save();
		},
		update: (hex, i) => {
			palette.user.colors[i].hex = hex;
			return palette.save();
		},
	},
};

const viewport = {
	selectors: {
		viewport: "#viewport",
		colorList: ".color-list",
		colorRow: ".color-row",
		colorInput: 'input[name="color-input"]',
	},
	setBackground: (color) => {
		if (Calc.brightnessByColor(palette.user.settings.background) < 128) {
			document.querySelector(viewport.selectors.viewport).classList.add("viewport--inverted");
		} else {
			document.querySelector(viewport.selectors.viewport).classList.remove("viewport--inverted");
		}
		document.querySelector(viewport.selectors.viewport).style.backgroundColor = color;
	},
	render: () => {
		const { user: { settings: { background, saturation }, colors } } = palette;

		viewport.setBackground(background);
		document.querySelector("#viewport-background-color").value = background === "white" ? "#FFFFFF" : background === "black" ? "#000000" : background;
		document.querySelector("#reset-viewport-button").style.display = "none";
		
		const colorList = colors.map((color) => {
			return viewport.colorRow(color.hex,color.alphaHsl);
		});
		document.querySelector(viewport.selectors.colorList).innerHTML = colorList.join("") + viewport.colorRow();
		
		document.querySelectorAll('output[name="color-output"]').forEach((item) => {
			item.addEventListener("click", () => {
				navigator.clipboard.writeText(item.value.trim()).then(Toast.render("📋 Color copied to clipboard!"));
			});
		});
		
		document.querySelectorAll(viewport.selectors.colorInput).forEach((input, i) => {
			const oldValue = input.value;
			viewport.handleUpdate(oldValue, input, i);
		});
	},
	handleUpdate: (oldValue, input, i) => {
		input.addEventListener("change", () => {
			const newValue = input.value;
			if (newValue) {
				const newHexValue = Calc.validateHex(newValue);
				if (newHexValue) {
					if (i - palette.user.colors.length === 0) {
						palette.color.add(newHexValue);
						renderDom(() => {
							document.querySelectorAll(viewport.selectors.colorInput)[i + 1].select();
							document.querySelectorAll(viewport.selectors.colorRow)[i + 1].classList.add("color-row--animated");
							document.querySelectorAll(viewport.selectors.colorRow)[i + 1].style.animationName = "moveDown";
						});
					} else {
						palette.color.update(newHexValue, i);
						renderDom(() => {
							document.querySelectorAll(viewport.selectors.colorInput)[i + 1].select();
							document.querySelectorAll(viewport.selectors.colorRow)[i].classList.add("color-row--animated");
							document.querySelectorAll(viewport.selectors.colorRow)[i].style.animationName = "scaleDown";
						});
					}
				} else {
					input.value = oldValue;
					Toast.render("🙏 Only HEX values, please!");
					Input.shake(input);
				}
			} else {
				palette.color.remove(i);
				renderDom(() => {
					document.querySelectorAll(viewport.selectors.colorInput)[i].select();
					document.querySelectorAll(viewport.selectors.colorRow)[i].classList.add("color-row--animated");
					document.querySelectorAll(viewport.selectors.colorRow)[i].style.animationName = "moveUp";
				});
			}
		});
	},
	colorRow: (input = "", output = "") => {
		const isColorInvert = Calc.brightnessByColor(input) > 128 ? true : false;
		const isBackgroundInvert = Calc.brightnessByColor(palette.user.settings.background) < 128 ? true : false;
		const outputDiv = `<div class="color-row__output" style="background-color: hsla(${output.h},${output.s}%,${output.l}%,${output.a})">
												<svg class="color-row__icon" style="background-color: ${input}" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.29293 2.29286C4.90241 2.68338 4.90241 3.31655 5.29293 3.70707L9.58582 7.99996L5.29293 12.2929C4.90241 12.6834 4.90241 13.3165 5.29293 13.7071C5.68345 14.0976 6.31662 14.0976 6.70714 13.7071L11.7071 8.70707C12.0977 8.31655 12.0977 7.68338 11.7071 7.29286L6.70714 2.29286C6.31662 1.90233 5.68345 1.90233 5.29293 2.29286Z" fill="currentColor"/></svg>
												<output class="color-output ${isColorInvert ? " color-output--invert" : ""}" name="color-output" aria-label="Transparent color output" title="Copy to clipboard">
													hsla(${output.h},${palette.user.settings.saturation.mode === "custom" ? `<span class="color-output__callout">${output.s}%</span>` : `${output.s}%`},${output.l}%,<span class="color-output__callout">${output.a}</span>)
												</output>
											</div>`;
		return `<li class="color-row ${isColorInvert ? "color-row--invert" : ""}${!input ? (isBackgroundInvert ? "color-row--empty--invert" : "color-row--empty") : ""}">
							<div class="color-row__input" style="background-color: ${input}">
								<input class="input" type="text" name="color-input" value="${input}" placeholder="Add color..." aria-label="Color input">
							</div>
							${output ? outputDiv : ""} 
						</li>`;
	},
};

const settings = {
	selectors: {
		settings: "#settings",
	},
	render: () => {
		const { user: { settings: { background, saturation } } } = palette;
		
		if (background === "white" || background === "black") {
			document.querySelector(`input[name="background-mode"][value="${background}"]`).checked = true;
			document.querySelector("#backround-color").style.display = "none";
		} else {
			document.querySelector("#background-custom").checked = true;
			document.querySelector("#backround-color").style.display = "flex";
			document.querySelector("#backround-color > input[type='text']").value = background;
		}

		document.querySelector(`input[name="saturation-mode"][value="${saturation.mode}"]`).checked = true;
		document.querySelector("#saturation-adjustments").style.display = saturation.mode === "custom" ? "inherit" : "none";
		document.querySelector("#saturation-gradation").value = saturation.gradation;
		document.querySelector("#saturation-intensity").value = saturation.intensity;
		document.querySelector("#saturation-offset").value = saturation.offset;
		
		document.querySelectorAll(".slider__input").forEach((item) => {
			Slider.update(item);
		});

		const saturationChartData = palette.user.colors.map((color) => { return color.alphaHsl.s; });
		saturationChart.data.datasets[0].data = saturationChartData
		saturationChart.data.labels = saturationChartData
		saturationChart.update();

		// document.querySelector("#background-mode").addEventListener("input", settings.handleUpdate);
		// document.querySelector("#backround-color > input[type='color']").addEventListener("input", settings.handleUpdate);
		// document.querySelector("#backround-color > input[type='text']").addEventListener("change", settings.handleUpdate);
		// document.querySelector("#saturation").addEventListener("input", settings.handleUpdate);
	},
	handleUpdate: () => {
		const { user: { settings } } = palette;
		
		if (document.querySelector("input[name='background-mode']:checked").value === "custom") {
			const input = document.querySelector("#backround-color > input[type='text']");
			const newHexValue = Calc.validateHex(input.value);
			if (newHexValue) {
				settings.background = newHexValue;
			} else {
				Toast.render("🙏 Only HEX values, please!");
				Input.shake(input);
			}
		} else {
			settings.background = document.querySelector("input[name='background-mode']:checked").value;
		}
		
		settings.saturation.mode = document.querySelector("input[name='saturation-mode']:checked").value;
		settings.saturation.gradation = document.querySelector("#saturation-gradation").value;
		settings.saturation.intensity = document.querySelector("#saturation-intensity").value;
		settings.saturation.offset = document.querySelector("#saturation-offset").value;
		
		palette.save();
		renderDom();
	}
};

const saturationChart = new Chart(document.querySelector("#saturation-chart").getContext("2d"), {
	type: 'line',
	data: {
		labels: [],
		datasets: [{
			data: [],
			pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-text-icon-muted'),
			pointBorderWidth: 0,
			pointRadius: 2,
			borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-border-default-alpha'),
			borderWidth: 2
		}]
	},
	options: {
		plugins: {
			tooltip: {
				enabled: false
			},
			legend: {
				display: false
			}
		},
		scales: {
			x: {
				display: false,
			},
			y: {
				beginAtZero: true,
				ticks: {
					color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-icon-muted'),
					font: {
						family: getComputedStyle(document.documentElement).getPropertyValue('--family-sans-serif'),
					}
				},
				grid: {
					color: getComputedStyle(document.documentElement).getPropertyValue('--color-border-default-alpha'),
					borderColor: "transparent",
					tickColor: null,
				},
				suggestedMin: 0,
        suggestedMax: 100
			}
		},
		transitions: false,
	}
});

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
			hexOutput.push(palette.user.colors[i].hex + " → " + Calc.hslaToHex(hsla.h, hsla.s, hsla.l, hsla.a * 100 + "%"));
		}
		output = hexOutput.join("\n");
	} else {
		output = JSON.stringify(palette.user, null, 2);
	}
	document.querySelector("#export-output").innerHTML = output;
}

function renderDom(callback, animate) {
	palette.user = palette.load() || JSON.parse(JSON.stringify(palette.initial));
	palette.calculate();
	settings.render();
	viewport.render();
	palette.save();
	renderExport();
	if (callback) {
		callback();
	}
	if (animate) {
		document.querySelectorAll(viewport.selectors.colorRow).forEach((colorRow, i) => {
			colorRow.classList.add("color-row--animated-in");
			colorRow.style.animationDelay = 10 * i + "ms";
			colorRow.addEventListener("animationend", () => {
				colorRow.classList.remove("color-row--animated-in");
				colorRow.style.cssText = "";
			});
		});
	}
}

window.onload = () => {
	renderDom(() => {
		document.querySelector("#settings").addEventListener("input", settings.handleUpdate);
		document.querySelector("#background-color").addEventListener("input", (event) => {
			event.stopPropagation();
		});
		document.querySelector("#background-color").addEventListener("change", settings.handleUpdate);
	}, true);
	// Listen for events

	if (localStorage.getItem("visited") === null) {
		document.querySelector("#welcome-dialog").showModal();
		localStorage.setItem("visited", true);
	}

	document.querySelectorAll('button[name="button-dialog-open"').forEach((item) => {
		item.addEventListener("click", () => {
			document.querySelector("#" + item.dataset.dialog + "-dialog").showModal();
		});
	});

	document.querySelectorAll('button[name="button-dialog-close"').forEach((item) => {
		item.addEventListener("click", () => {
			item.closest("dialog").close();
		});
	});

	document.querySelector("#button-reset").addEventListener("click", () => {
		palette.remove();
		document.querySelector("#reset-dialog").close();
		Toast.render("✨ Starting fresh!");
		renderDom(undefined, true);
	});

	document.querySelectorAll("input[name='import']").forEach(item => {
		item.addEventListener("click", () => {
			const importInput = document.querySelector("#import-input");
			if (item.value === "hex") {
				importInput.placeholder = "Paste comma separated HEX colors here"
			} else {
				importInput.placeholder = "Paste exported JSON here"
			}
		});
	});

	document.querySelector("#button-import").addEventListener("click", () => {

		const importInput = document.querySelector("#import-input");
		if (document.querySelector("input[name='import']:checked").value === "hex") {
			palette.user.colors.length = 0;

			const hexColors = importInput.value.replace(/,\s*$/, "").split(",");
			hexColors.forEach(color => {
				const validatedColor = Calc.validateHex(color.trim());
				if (validatedColor) {
					palette.user.colors.push({ "hex": color.trim(), alphaHsl: {} });
				}
			})
			palette.save();
		} else {
			localStorage.setItem("palette", JSON.stringify(JSON.parse(importInput.value)));
		}
		document.querySelector("#import-dialog").close();
		importInput.value = "";
		Toast.render("🎉 Palette imported!");
		renderDom(undefined, true);
	});

	document.querySelectorAll("input[name='export']").forEach((item) => {
		item.addEventListener("click", () => {
			return renderExport();
		});
	});

	document.querySelector("#button-reverse").addEventListener("click", () => {
		palette.user.colors.reverse();
		palette.save();
		Toast.render("🤏 Colors reversed!");
		renderDom(undefined, true);
	});

	document.querySelector("#button-clear").addEventListener("click", () => {
		palette.user.colors.length = 0;
		palette.save();
		Toast.render("🗑 Colors removed!");
		renderDom();
	});

	document.querySelector("#viewport-background-color").addEventListener("input", function () {
		viewport.setBackground(this.value);
		const resetButton = document.querySelector("#reset-viewport-button");
		resetButton.style.display = "inherit";
		resetButton.addEventListener("click", function () {
			document.querySelector("#viewport-background-color").value =
			palette.user.settings.background === "white" ? "#FFFFFF" : palette.user.settings.background === "black" ? "#000000" : palette.user.settings.background;
			viewport.setBackground(palette.user.settings.background);
			resetButton.style.display = "none";
		});
	});

	document.querySelectorAll(".input--color-combo").forEach(function (item) {
		item.childNodes[1].value = item.childNodes[3].value;
		item.childNodes[1].addEventListener("input", function () {
			this.nextElementSibling.value = this.value;
		});
		item.childNodes[3].addEventListener("change", function () {
			this.previousElementSibling.value = this.value;
		});
	});

	document.querySelectorAll(".slider__input").forEach((item) => {
		item.addEventListener("input", (event) => {
			Slider.update(item);
		});
	});

	document.querySelector("#button-export-copy").addEventListener("click", () => {
		const exportInput = document.querySelector("#export-output");
		navigator.clipboard.writeText(exportInput.value).then(Toast.render("📋 Export copied to clipboard!", document.querySelector("#export-dialog")));
	})
}