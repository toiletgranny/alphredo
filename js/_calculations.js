function colorNameToHex(color)
{
    var colors = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
    "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
    "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
    "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
    "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
    "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
    "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
    "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
    "honeydew":"#f0fff0","hotpink":"#ff69b4",
    "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
    "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
    "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
    "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
    "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
    "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
    "navajowhite":"#ffdead","navy":"#000080",
    "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
    "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
    "rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
    "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
    "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
    "violet":"#ee82ee",
    "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
    "yellow":"#ffff00","yellowgreen":"#9acd32"};

    if (typeof colors[color.toLowerCase()] != 'undefined') {
			return colors[color.toLowerCase()];
		} else {
    	return false;
		};
}

export function brightnessByColor (color) {
	/**
	 * Calculate brightness value by RGB or HEX color.
	 * @param color (String) The color value in RGB or HEX (for example: #000000 || #000 || rgb(0,0,0) || rgba(0,0,0,0))
	 * @returns (Number) The brightness value (dark) 0 ... 255 (light)
	 * https://gist.github.com/w3core/e3d9b5b6d69a3ba8671cc84714cca8a4?permalink_comment_id=3125287#gistcomment-3125287
	 */

	if (/^[a-z]+$/.test(color)) {
		var color = colorNameToHex(color);
	};

	var color = "" + color, isHEX = (colorNameToHex(color) || color).indexOf("#") == 0, isRGB = color.indexOf("rgb") == 0;
	if (isHEX) {
		const hasFullSpec = color.length == 7;
		var m = color.substr(1).match(hasFullSpec ? /(\S{2})/g : /(\S{1})/g);
		if (m) var r = parseInt(m[0] + (hasFullSpec ? '' : m[0]), 16), g = parseInt(m[1] + (hasFullSpec ? '' : m[1]), 16), b = parseInt(m[2] + (hasFullSpec ? '' : m[2]), 16);
	}
	if (isRGB) {
		var m = color.match(/(\d+){3}/g);
		if (m) var r = m[0], g = m[1], b = m[2];
	}
	if (typeof r != "undefined") return ((r*299)+(g*587)+(b*114))/1000;
}

export const lerp = (x, y, a) => x * (1 - a) + y * a;

export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export const easingFunctions = {
	linear: (t) => t,
	easeInQuad: (t) => t * t,
	easeOutQuad: (t) => t * (2 - t),
	easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
	easeInCubic: (t) => t * t * t,
	easeOutCubic: (t) => --t * t * t + 1,
	easeInOutCubic: (t) =>
		t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
	easeInQuart: (t) => t * t * t * t,
	easeOutQuart: (t) => 1 - --t * t * t * t,
	easeInOutQuart: (t) =>
		t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
	easeInQuint: (t) => t * t * t * t * t,
	easeOutQuint: (t) => 1 + --t * t * t * t * t,
	easeInOutQuint: (t) =>
		t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,
};

const hexToRgb = (hex) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return [
		parseInt(result[1], 16),
		parseInt(result[2], 16),
		parseInt(result[3], 16),
	];
}

const rgbToHsl = (r,g,b) => {
	// https://css-tricks.com/converting-color-spaces-in-javascript/

	// Make r, g, and b fractions of 1
	r /= 255;
	g /= 255;
	b /= 255;

	// Find greatest and smallest channel values
	let cmin = Math.min(r,g,b),
			cmax = Math.max(r,g,b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;
	
	// Calculate hue
	// No difference
	if (delta == 0)
		h = 0;
	// Red is max
	else if (cmax == r)
		h = ((g - b) / delta) % 6;
	// Green is max
	else if (cmax == g)
		h = (b - r) / delta + 2;
	// Blue is max
	else
		h = (r - g) / delta + 4;

	h = Math.round(h * 60);
		
	// Make negative hues positive behind 360°
	if (h < 0)
			h += 360;      
		
	// Calculate lightness
	l = (cmax + cmin) / 2;

	// Calculate saturation
	s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		
	// Multiply l and s by 100
	s = +(s * 100).toFixed(1);
	l = +(l * 100).toFixed(1);

	return [h,s,Math.round(l)];
}

export const hslaToHex = (h, s, l, alpha) => {
	l /= 100;
	const a = s * Math.min(l, 1 - l) / 100;
	const f = n => {
		const k = (n + h / 30) % 12;
		const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
	};
	return `#${f(0)}${f(8)}${f(4)}, ${alpha}`;
}

export function validateHex(hex) {
	const hexFormats = [/^#([A-Fa-f0-9]{6})$/,/^([A-Fa-f0-9]{6})$/];
	if (hexFormats.some(rx => rx.test(hex))) {
		return hex = !hexFormats[0].test(hex) ? "#" + hex : hex;
	} else {
		return false
	};
}

export const getAlphaColor = (colorHex, backgroundHex, strength = 1) => {
	
	// Convert input HEXes to RGBs (arrays)
	const color = hexToRgb(colorHex);
	const surface = hexToRgb(backgroundHex === 'white' ? '#FFFFFF' : backgroundHex === 'black' ? '#000000' : backgroundHex);

	// Calculate alpha value per channel, pick the highest value
	const alphaPerChannel = color.map((channel, i) => {
		return [
			(channel - surface[i]) / (255 - surface[i]),
			(channel - surface[i]) / (0 - surface[i])
		];
	});
	const alpha = Math.max(...alphaPerChannel.flat().filter(value => 
		/^-?\d+\.?\d*$/.test(value)
	));

	// Calculate new RGB values based on the alpha
	const alphaColor = color.map((foo, i) => {
		return Math.round((foo - surface[i] + surface[i] * alpha) / alpha);
	});

	if (alphaColor.includes(NaN)) {
		const hsl = rgbToHsl(color[0], color[1], color[2]);
		return {
			h: hsl[0],
			s: Math.round(hsl[1] * strength),
			l: hsl[2],
			a: 1,
		};
	} else {
		const hsl = rgbToHsl(alphaColor[0], alphaColor[1], alphaColor[2]);
		return {
			h: hsl[0],
			s: Math.round(hsl[1] * strength),
			l: hsl[2],
			a: Math.round((alpha + Number.EPSILON) * 100) / 100,
		};
	};
}
