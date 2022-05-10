/*  --------

TODO:
[x] Zmienić strukturę palette, aby wprowadzić 'enabled/disblaed',
[x] Dodać informację o saturacji do funkcji renderowania ustawień,
[x] Zastanowić się nad refactorem pobierania i zapisywania informacji z formularza,
[x] Dodać obsługę edycji palety,
[x] Dodać globalną walidację inputów z hexami,
[x] Przyjrzeć się niedziałającemu parametrowi offset w saturacji,
[x] Dodać przechowywanie palety w local storage,
[x] Dodać opcję eksportowania, importowania i resetowania palety,
[x] Zaktualizować opisy ustawień,
[x] Obsłuzyć niemoliwe kalkulacje koloru,
[x] Dodać dynamiczną zmianę koloru tekstu na tle,
[x] Dodać ustawienia zmiany koloru tła podglądu,
[ ] Dodać opcję usunięcia kolorów,
[ ] Dodać opcję transparentnej siatki widocznej na hoverze,
[ ] Obsługa błędów,
[ ] Refactor kodu:
		[ ]Rozwiązać problem powtarzania się w zapisywaniu informacji do palette po kadej jednej zmianie
[ ] Modal informacyjny,

---------- */

"use strict";

import { brightnessByColor, hslaToHex, calculatePalette } from "./_calculations.js";
import * as Toast from "./_toast.js";

let palette = {};
// let palette = {
// 	user: {},
// 	initial: {
// 		settings: {
// 			background: "white",
// 			saturation: {
// 				mode: "default",
// 				intensity: 1,
// 				offset: 0,
// 				easing: "easeOutQuart",
// 			},
// 		},
// 		colors: [
// 			{
// 				hex: "#0C0E19",
// 				alphaHsl: null,
// 			},
// 			{
// 				hex: "#1C2035",
// 				alphaHsl: null,
// 			},
// 			{
// 				hex: "#303651",
// 				alphaHsl: null,
// 			},
// 			{
// 				hex: "#4A516D",
// 				alphaHsl: null,
// 			},
// 			{
// 				hex: "#697089",
// 				alphaHsl: null,
// 			},
// 			{
// 				hex: "#989EB3",
// 				alphaHsl: null,
// 			},
// 			{
// 				hex: "#C7CBD8",
// 				alphaHsl: null,
// 			},
// 			{
// 				hex: "#E6E8F0",
// 				alphaHsl: null,
// 			},
// 			{
// 				hex: "#F4F6F9",
// 				alphaHsl: null,
// 			},
// 		],
// 	},
// 	load: () => {
// 		JSON.parse(localStorage.getItem("palette_2"));
// 	},
// 	save: () => {
//     localStorage.setItem("palette_2", JSON.stringify(palette2.initial));
//   },
// 	clear: () => {
// 		localStorage.removeItem("palette_2");
// 	}
// }

const viewport = document.querySelector("#viewport");
const colorListContainer = document.querySelector("#color-list");
const settings = document.querySelector("#settings");
const initialPalette = {
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
};
const modeBackground = {
	darken: "#FFFFFF",
	lighten: "#000000",
};


function renderExport() {
	const outputType = document.querySelector("input[name='export']:checked").value;
	let output;
	if (outputType === "hsla") {
		const hslaOutput = [];
			for (let i = 0; i < palette.colors.length; i++) {
				const hsla = palette.colors[i].alphaHsl;
				hslaOutput.push(`${palette.colors[i].hex} → hsla(${hsla.h},${hsla.s}%,${hsla.l}%,${hsla.a})`);
			}
			output = hslaOutput.join("\n");    
	} else if (outputType === "hex") {
		const hexOutput = [];
		for (let i = 0; i < palette.colors.length; i++) {
			const hsla = palette.colors[i].alphaHsl;
			hexOutput.push(palette.colors[i].hex + " → " + hslaToHex(hsla.h,hsla.s,hsla.l,hsla.a*100 + "%"));
		}
		output = hexOutput.join("\n");
	} else {
		output = JSON.stringify(palette, null, 2);
	}
	document.querySelector("#export-output").innerHTML = output;
}

const colorRow = (input = '', output = '') => {
	const outputDiv = `<div class="color-list__elem__output" style="background-color: hsla(${output.h},${output.s}%,${output.l}%,${output.a})">
											<output class="color-output ${brightnessByColor(input) > 128 ? ' color-output--invert' : ''}" aria-label="Transparent color output" onclick="copyToClipboard()" title="Copy to clipboard">
												hsla(${output.h},${palette.settings.saturation.mode === "custom" ? `<span class="color-output__callout">${output.s}%</span>` : `${output.s}%`},${output.l}%,<span class="color-output__callout">${output.a}</span>)
											</output>
										</div>`
	return `<li class="color-list__elem ${!input && !output ? 'color-list__elem--empty' : ''}">
						<div class="color-list__elem__input" style="background-color: ${input}">
							<input class="input" type="text" name="color-input" value="${input}" placeholder="Add color..." maxlength="7" aria-label="Color input">
						</div> 
						${output ? outputDiv : ''} 
					</li>`
}

function renderViewport() {
	viewport.style.backgroundColor = palette.settings.background;
	document.querySelector("#viewport-background-color").value = palette.settings.background === 'white' ? '#FFFFFF' : palette.settings.background === 'black' ? '#000000' : palette.settings.background;
	colorListContainer.innerHTML = "";
	let colorList = "";
	
	for (let i = 0; i < palette.colors.length; i++) {
		colorList += colorRow(palette.colors[i].hex, palette.colors[i].alphaHsl);
	};
	colorList += colorRow();
	colorListContainer.innerHTML += colorList;

	// Listen for changes V1
	// const inputColors = document.querySelectorAll('input[name="color-input"]');
	// for (let i = 0; i < inputColors.length; i++) {
	// 	const input = inputColors[i];
	// 	const oldValue = input.value;
	// 	input.addEventListener('change', event => {
	// 		// If the input is empty, remove that color from the array
	// 		if (input.value === '') { 
	// 			palette.colors.splice(i,1);
	// 			localStorage.setItem("palette", JSON.stringify(palette))
	// 			renderDom()
	// 		// Check if valid hex code, otherwise ingore input; do nothing
	// 		} else if (input.value.match(/^#([A-Fa-f0-9]{6})$/)) { 
	// 			if (i - palette.colors.length === 0){ // If that's a new color, add it to the array
	// 				palette.colors.push({'hex': input.value, 'alphaHsl': null});
	// 				localStorage.setItem("palette", JSON.stringify(palette));
	// 			// If that's an existing color, update it's value
	// 			} else { 
	// 				palette.colors[i].hex = input.value;
	// 				localStorage.setItem("palette", JSON.stringify(palette));
	// 			}
	// 			renderDom()
	// 		} else {
	// 			input.value = oldValue;
	// 			Toast.render("🙏 Only HEX values, please!");
	// 			input.classList.add("input--error");
	// 		}
	// 	})
	// }

	// Listen for changes V2

	// const inputColors = document.querySelectorAll('input[name="color-input"]');
	// for (let i = 0; i < inputColors.length; i++) {
	// 	const colorRow = inputColors[i].closest(".color-list__elem");
	// 	const input = inputColors[i];
	// 	const oldValue = input.value;
	// 	input.addEventListener('change', event => {
	// 		// If the input is empty, remove that color from the array
	// 		if (input.value === '') { 
	// 			palette.colors.splice(i,1);
	// 			localStorage.setItem("palette", JSON.stringify(palette));
	// 			calculatePalette(palette);
	// 			colorRow.classList.add('color-list__elem--hidden');
	// 			setTimeout(() => colorRow.remove(), 300);
	// 		// Check if valid hex code, otherwise ingore input; do nothing
	// 		} else if (input.value.match(/^#([A-Fa-f0-9]{6})$/)) { 
	// 			if (i - palette.colors.length === 0){ // If that's a new color, add it to the array
	// 				palette.colors.push({'hex': input.value, 'alphaHsl': null});
	// 				localStorage.setItem("palette", JSON.stringify(palette))
	// 			// If that's an existing color, update it's value
	// 			} else { 
	// 				palette.colors[i].hex = input.value;
	// 				localStorage.setItem("palette", JSON.stringify(palette))
	// 			}
	// 			calculatePalette(palette);
	// 		} else {
	// 			input.value = oldValue;
	// 			Toast.render("🙏 Only HEX values, please!");
	// 			input.classList.add("input--error");
	// 		}
	// 	})
	// }
}

function renderSettings() {
	if (palette.settings.background === 'white' || palette.settings.background === 'black') {
		document.querySelector(`input[name="background-mode"][value="${palette.settings.background}"]`).checked = true;
		document.querySelector('#background-color').style.display = "none";
	} else {
		document.querySelector('#background-custom').checked = true;
		document.querySelector('#background-color').style.display = "inherit";
		document.querySelector('#background-color').value = palette.settings.background;
	}
	document.querySelector(`input[name="saturation-mode"][value="${palette.settings.saturation.mode}"]`).checked = true;
	document.querySelector('#saturation-adjustments').style.display = palette.settings.saturation.mode === "custom" ? "inherit" : "none"
	document.querySelector(`option[value="${palette.settings.saturation.easing}"]`).selected = true;
	document.querySelector('input[name="saturation-intensity"]').value = palette.settings.saturation.intensity;
	document.querySelector('input[name="saturation-offset"]').value = palette.settings.saturation.offset;
}

function renderDom() {
	palette = JSON.parse(localStorage.getItem("palette")) || initialPalette;
	calculatePalette(palette);
	renderViewport();
	renderSettings();
	localStorage.setItem("palette", JSON.stringify(palette))
}

// Listen for changes

settings.addEventListener("input", function() {
	if (document.querySelector("input[name='background-mode']:checked").value === 'custom') {
		const input = document.querySelector("#background-color").value;
		if (input.match(/^#([A-Fa-f0-9]{6})$/)) {
			palette.settings.background = input
		} else if (input.match(/^([A-Fa-f0-9]{6})$/)) {
			palette.settings.background = "#" + input
		}
		document.querySelector('#background-color').style.display = "inherit";
	} else {
		palette.settings.background = document.querySelector("input[name='background-mode']:checked").value;
	};

	palette.settings.saturation.mode = document.querySelector("input[name='saturation-mode']:checked").value;
	palette.settings.saturation.intensity = document.querySelector("input[name='saturation-intensity']").value;
	palette.settings.saturation.offset = document.querySelector("input[name='saturation-offset']").value;
	palette.settings.saturation.easing = document.querySelector("select[name='saturation-easing']").value;

	localStorage.setItem("palette", JSON.stringify(palette))
	renderDom();
})


// Import, Export, Reset

document.querySelector("#reset-button").addEventListener("click", function(){
	if (confirm("This will erase your palette and settings. Are you sure want to continue?")) {
		localStorage.clear();
		palette = {};
		renderDom();
		Toast.render("✨ Starting fresh!");
	}
})

document.querySelector("#import-button").addEventListener("click", function(){
	const importInput = JSON.parse(document.querySelector("#import-input").value);
	localStorage.setItem("palette", JSON.stringify(importInput));
	importDialog.close();
	renderDom();
	Toast.render("🎉 Palette imported!");
})

document.querySelector("#export-dialog-button").addEventListener("click", function() {
	renderExport()
	document.querySelector("#export-dialog").showModal();
})

document.querySelectorAll("input[name='export']").forEach(item => {
	item.addEventListener("click", function() {
		renderExport()
	});
})

document.querySelector("#viewport-background-color").addEventListener("input",function() {
	viewport.style.backgroundColor = this.value;
	const resetButton = document.querySelector("#reset-viewport-button");
	resetButton.style.display = "inherit";
	resetButton.addEventListener("click", function(){
		document.querySelector("#viewport-background-color").value = palette.settings.background === 'white' ? '#FFFFFF' : palette.settings.background === 'black' ? '#000000' : palette.settings.background;
		viewport.style.backgroundColor = palette.settings.background;
		resetButton.style.display = "none";
	})
})

renderDom();

const colorInputs = document.querySelectorAll('input[name="color-input"]');
colorInputs.forEach((input, i) => {
	const row = input.closest('.color-list__elem');
	input.addEventListener("change",() => {
		if (input.value === '') {
			palette.colors[i].hex = "dupa";
			console.log("Cleared");
			palette2.clear();
			// setTimeout(function() { row.remove },1000);
		}
	})
});