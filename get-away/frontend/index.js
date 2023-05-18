let origin = document.getElementById('start-place');
let destination = document.getElementById('end-place');
let departDate = document.getElementById('depart-date');
let returnDate = document.getElementById('return-date');
let oneWay = document.getElementById('one-way');
let budget = document.getElementById('budget');
let people = document.getElementById('adult-count');
let submitButton = document.getElementById('start-submit');

initLocationAutoFill();

const today = toDateString(new Date());
departDate.setAttribute("min", today);
returnDate.setAttribute("min", today);
departDate.addEventListener('change', event => {
		if (Date.parse(returnDate.value) < Date.parse(event.target.value)) {
			returnDate.value = event.target.value;
		}
	});
returnDate.addEventListener('change', event => {
		if (Date.parse(departDate.value) > Date.parse(event.target.value)) {
			departDate.value = event.target.value;
		}
	});
document.querySelectorAll(`#start-form input`).forEach(input => input.addEventListener('input', checkInputs));
	

function initLocationAutoFill() {
	
	amadeusToken().then(token => {
		document.querySelectorAll(`input.location-input`).forEach((input, index) => {
			let list = document.createElement("datalist");
			list.id = "locations-" + index;
			input.setAttribute("list", list.id);
			let memo = {};
			let update = element => {
				let value = element.value.toLowerCase();
				if (value.length < 1 || value.includes(",")) {
					list.replaceChildren();
					return;
				}
				if (value in memo) {
					list.replaceChildren(...memo[value]);
					return;
				}
				fetch("https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY&keyword=" + value, {headers: {'Authorization': token}})
				.then(response => response.json())
				.then(body => {
					options = body.data.map(location => {
						let address = location.address;
						let option = document.createElement("option");
						option.value = titleCase(address.cityName) + ", ";
						if (address.countryCode == "US") {
							option.value += address.stateCode;
						} else {
							option.value += address.countryCode;
						}
						return option;
					});
					memo[value] = options;
					list.replaceChildren(...options);
				}, console.log);
			};
			input.addEventListener('input', event => update(event.target));
			update(input);
			input.appendChild(list);
		});
	});
}

function submit() {

	data = {};
	for (const field of startFields) {
		const input = document.querySelector(`#start-form input[name='${field}']`);
		if (input) {
			if (input.getAttribute("type") == "checkbox") {
				data[field] = !!input.checked;
			} else {
				data[field] = input.value;
			}
		}
	}
	if (!startFields.every(field => localStorage.getItem(field) === data[field].toString())) {
		localStorage.clear();
		for (const [field, value] of Object.entries(data)) {
			localStorage.setItem(field, value);
		}
		getGeoData("origin")
			.then(() => timeout(500))
			.then(() => getGeoData("destination"))
			.then(() => timeout(50))
			.then(() => window.location.href = "./cards.html")
			.catch(console.log);
	} else {
		window.location.href = "./cards.html";
	}
}

function getGeoData(location) {
	
	const city = localStorage.getItem(location).split(', ')[0];
	return amadeusToken().then(token => fetch("https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY&keyword=" + city, {headers: {'Authorization': token}})
		.then(response => response.json())
		.then(body => body?.data?.[0]?.geoCode)
		.then(geo => {
			if (!geo) {
				return Promise.reject(`No matches found for ${location}!`);
			}
			return Promise.resolve(geo);
		})
	).then(geo => {
		localStorage.setItem(location + "_latitude", geo.latitude);
		localStorage.setItem(location + "_longitude", geo.longitude);
	});
}

function checkInputs() 
{
	submitButton.disabled = !(validCity(origin.value) && validCity(destination.value) && validDates(departDate.value, returnDate.value, oneWay.checked) && budget.value && people.value);
}

function validCity(value) {
	
	const [city, code] = value.split(", ");
	return city && code && (/^[A-Z][A-Z]$/).test(code);
}

function validDates(depart, arrive, oneWay) {
	
	if (oneWay) {
		return !!depart;
	}
	return depart && arrive && Date.parse(depart) < Date.parse(arrive);
}

function toDateString(date) {
	
	return date.toISOString().split("T")[0];
}

origin.addEventListener('input', checkInputs);
destination.addEventListener('input', checkInputs);
departDate.addEventListener('input', checkInputs);
returnDate.addEventListener('input', checkInputs);
oneWay.addEventListener('input', checkInputs);
budget.addEventListener('input', checkInputs);
people.addEventListener('input', checkInputs);