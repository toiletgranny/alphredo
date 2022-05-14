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
	calculate: (palette) => {
		for (let i = 0; i < palette.colors.length; i++) {
			let saturationStrength = 0;
			if (palette.settings.saturation.mode === "custom") {
				const multiplier = i / palette.colors.length;
				saturationStrength = Calc.lerp(
					1,
					Calc.clamp(Calc.easingFunctions[palette.settings.saturation.gradation](multiplier) + (palette.settings.saturation.offset * 10) / 10, 0, 1),palette.settings.saturation.intensity);
				} else {
					saturationStrength = 1;
				}
				palette.colors[i].alphaHsl = Calc.getAlphaColor(palette.colors[i].hex, palette.settings.background, saturationStrength);
			}
		console.log(palette);
		return palette;
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
		colorList: "#color-list",
		colorRow: ".color-row",
		colorInput: 'input[name="color-input"]',
	},
	setBackground: (color) => {
		return (document.querySelector(viewport.selectors.viewport).style.backgroundColor = color);
	},
	render: () => {
		const colorListContainer = document.querySelector(viewport.selectors.colorList);
		
		viewport.setBackground(palette.user.settings.background);
		document.querySelector("#viewport-background-color").value =
		palette.user.settings.background === "white" ? "#FFFFFF" : palette.user.settings.background === "black" ? "#000000" : palette.user.settings.background;
		document.querySelector("#reset-viewport-button").style.display = "none";
		
		const colorList = palette.user.colors.map((color) => {
			return viewport.colorRow(color.hex, color.alphaHsl);
		});
		colorListContainer.innerHTML = colorList.join("") + viewport.colorRow();
		
		document.querySelectorAll('output[name="color-output"]').forEach((item) => {
			item.addEventListener("click", () => {
				navigator.clipboard.writeText(item.value.trim()).then(Toast.render("📋 Color copied to clipboard!"));
			});
		});
		
		// viewport.listenForChanges();
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
		const outputDiv = `<div class="color-row__output" style="background-color: hsla(${output.h},${output.s}%,${output.l}%,${output.a})">
		<output class="color-output ${
			Calc.brightnessByColor(input) > 128 ? " color-output--invert" : ""
		}" name="color-output" aria-label="Transparent color output" title="Copy to clipboard">
		hsla(${output.h},${palette.user.settings.saturation.mode === "custom" ? `<span class="color-output__callout">${output.s}%</span>` : `${output.s}%`},${
			output.l
		}%,<span class="color-output__callout">${output.a}</span>)
		</output>
		</div>`;
		return `<li class="color-row${!input && !output ? (Calc.brightnessByColor(palette.user.settings.background) < 128 ? " color-row--empty--invert" : " color-row--empty") : ""}" draggable="true">
							<div class="color-row__input" style="background-color: ${input}">
								<input class="input" type="text" name="color-input" value="${input}" placeholder="Add color..." maxlength="7" aria-label="Color input">
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
		
		document.querySelector("#background-mode").addEventListener("input", settings.handleUpdate);
		document.querySelector("#backround-color > input[type='color']").addEventListener("input", settings.handleUpdate);
		document.querySelector("#backround-color > input[type='text']").addEventListener("change", settings.handleUpdate);
		document.querySelector("#saturation").addEventListener("input", settings.handleUpdate);
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
	},

};

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

// Chart
const saturationChart = new Chart(document.querySelector("#saturation-chart").getContext("2d"), {
	type: 'line',
	data: {
		labels: [],
		datasets: [{
			data: [],
			pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-text-icon-muted'),
			pointBorderWidth: 0,
			pointRadius: 4,
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

function renderDom(callback, animate) {
	palette.user = palette.load() || JSON.parse(JSON.stringify(palette.initial));
	palette.calculate(palette.user);
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

window.onload = renderDom(undefined, true);

// Listen for events

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

document.querySelector("#button-import").addEventListener("click", () => {
	localStorage.setItem("palette", JSON.stringify(JSON.parse(document.querySelector("#import-input").value)));
	document.querySelector("#import-dialog").close();
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