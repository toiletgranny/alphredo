export function shake(input) {
	input.classList.add("input--error")
	input.addEventListener("animationend", () => {
		input.classList.remove("input--error")
	})
}