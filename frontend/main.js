const page = document.querySelector("body").id;
const startFields = ["origin", "destination", "depart", "one-way", "return", "budget", "people"];

loadStartData();

// Returns promise with Amadeus auth token
const amadeusToken = amadeusInit();

function loadStartData() {
	
	for (const field of startFields) {
		let value = localStorage.getItem(field) ?? "";
		const input = document.querySelector(`#start-form input[name='${field}']`);
		if (input) {
			if (input.getAttribute("type") == "checkbox") {
				input.checked = value === 'true';
			} else {
				input.value = value;
			}
		}
	}
	const input = document.querySelector(`#start-form input[name='remaining-budget']`);
	if (input) {
		input.value = formatDollarAmount(getRemainingBudget());
	}
}

function getTotalSpending() {
	
	let total = 0;
	for (const [name, value] of Object.entries(localStorage)) {
		if (name.endsWith("_price") && !name.startsWith(page)) {
			total += parseFloat(value);
		}
	}
	return total;
}

function getRemainingBudget() {

	// if (removed) {
	// 	removed = false
	// 	if (localStorage.getItem("cars_price")) {
	// 		return parseFloat(localStorage.getItem("budget") ?? "0") - getTotalSpending() + localStorage.getItem("cars_price");
	// 	}
	// } else {
	// 	removed = false;
		return parseFloat(localStorage.getItem("budget") ?? "0") - getTotalSpending();
	// }
}

function amadeusInit() {
	
	let attempted = false;
	let token = null;
	return async () => {
		if (!attempted) {
			attempted = true;
			token = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: "grant_type=client_credentials&client_id=T6ZEoU4yyWvojQHdAC4RQedwAniwbksC&client_secret=Qdvz7aQie6QNAYXe"
			})
			.then(response => response.json())
			.then(data => data.token_type + " " + data.access_token);
		}
		if (!token) {
			throw new Error("Failed to authenticate Amadeus!");
		}
		return token;
	};
}

function titleCase(str) {
	
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function createGenericElement(data, tag) {
	
	let element = document.createElement(tag);
	element.innerHTML = data;
	return element;
}

function createImageElement(url) {
	
	let icon = document.createElement("img");
	icon.src = url;
	return icon;
}

function createAirlineIconElement(iata, width, height) {

	return createImageElement(`https://daisycon.io/images/airline/?iata=${iata}&width=${width}&height=${height}`);
}

function getDoubleRangeValues(name) {
	
	let min = document.querySelector(`input.range-min[type=number][name=${name}]`);
	let max = document.querySelector(`input.range-max[type=number][name=${name}]`);
	return {min: parseFloat(min.value), max: parseFloat(max.value)};
}

function getRadioValue(name) {
	
	return document.querySelector(`#filters input[name=${name}]:checked`).value;
}

function priceRangeValidation() {
	
	let min = document.querySelector("input.range-min[type=number][name='price']");
	let max = document.querySelector("input.range-max[type=number][name='price']");
	if (max && min) {
		let budget = getRemainingBudget();
		max.value = formatDollarAmount(budget);
		min.addEventListener("change", (event) => {
			let value = parseFloat(event.target.value || 0);
			if (value > budget) {
				value = budget;
			}
			if (value < 0) {
				value = 0;
			}
			let formatted = formatDollarAmount(value);
			if (value > parseFloat(max.value)) {
				max.value = formatted;
			}
			event.target.value = formatted;
		});
		max.addEventListener("change", (event) => {
			let value = parseFloat(event.target.value || 0);
			if (value > budget) {
				value = budget;
			}
			if (value < 0) {
				value = 0;
			}
			let formatted = formatDollarAmount(value);
			if (value < parseFloat(min.value)) {
				min.value = formatted;
			}
			event.target.value = formatted;
		});
	}
}

function formatDollarAmount(amount) {
	
	return amount.toFixed(2).replace(/[.,]00$/, "");
}

function timeout(ms) {
	
    return new Promise(resolve => setTimeout(resolve, ms));
}

function addPage(suffix) {
	
	return page + "_" + suffix;
}