const filters = [
	getPricePredicate,
	getStopsPredicate
];

let flights = [];
let carrierDetails = {};

async function main() {

	let oneWay = localStorage.getItem("one-way") === "true";
	let storedOrigin = localStorage.getItem(addPage("origin"));
	(storedOrigin && storedOrigin !== "undefined" ? Promise.resolve(storedOrigin) : closestAirport("origin"))
		.then(origin => {
			localStorage.setItem(addPage("origin"), origin);
			let storedDest = localStorage.getItem(addPage("destination"));
			timeout(150)
				.then(() => storedDest && storedDest !== "undefined" ? Promise.resolve(storedDest) : closestAirport("destination"))
				.then(dest => {
					localStorage.setItem(addPage("destination"), dest);
					fetchListings(origin, dest, oneWay)
						.finally(() => {
							loadListings(origin, dest, oneWay);
							document.querySelectorAll(`#filters input`).forEach(element => element.addEventListener("change", event => loadListings(origin, dest, oneWay)));
						});
				});
		});
}


main();
priceRangeValidation();

function getPricePredicate() {
	
	let values = getDoubleRangeValues("price");
	return flight => values.min <= flight.price.grandTotal && flight.price.grandTotal <= values.max;
}

function getStopsPredicate() {
	
	let value = getRadioValue("stops");
	if (value >= 2) {
		return flight => true;
	}
	return flight => value >= getNumberStops(flight.itineraries[0]);
}

function closestAirport(name) {
	
	return amadeusToken().then(token => fetch(`https://test.api.amadeus.com/v1/reference-data/locations/airports?sort=distance&latitude=${localStorage.getItem(name + "_latitude")}&longitude=${localStorage.getItem(name + "_longitude")}`, {headers: {'Authorization': token}}))
		.then(response => response.json())
		.then(body => body?.data?.[0]?.iataCode)
}

async function fetchListings(origin, destination, oneWay) {

	let package = { 
		originLocationCode: origin,
		destinationLocationCode: destination,
		departureDate: localStorage.getItem("depart"),
		maxPrice: localStorage.getItem("budget"),
		adults: localStorage.getItem("people"),
		currencyCode: 'USD',
	};

	if (!oneWay) {
		package.returnDate = localStorage.getItem("return");
	}

	console.log(package);

	try 
	{
		let response = await fetch('/initial-preferences', {
			method: 'POST',
			headers: {
			'Content-Type': 'application/json'
			},
			body: JSON.stringify(package)
		});
		let extracted = await response.json();
        flights = extracted["result"]["data"].sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));
        carrierDetails = extracted["result"]["dictionaries"]["carriers"];
		flights.forEach((flight, i) => flight.index = i);
	} 
	catch(error) 
	{
		console.error('ERROR IN FETCHING DATA: ', error);
	}
}

function loadListings(origin, destination, oneWay) {
	
	let route = origin + " → " + destination;
	let listings = document.querySelector("#listings");
	if (!listings) {
		return;
	}
	let predicates = filters.map(supplier => supplier());
	let newListings = flights.filter(flight => predicates.every(p => p(flight)))
		.map((flight) => {
			let container = document.createElement("li");
			container.classList.add("listing-container");
			let listing = document.createElement("div");
			container.addEventListener("click", () => selectFlight(listing));
			listing.classList.add("listing");
			container.appendChild(listing);
			listing.dataset.index = flight.index;
			let iata = flight.validatingAirlineCodes[0].toLowerCase()
			listing.appendChild(createAirlineIconElement(iata, 150, 60));
			let itinerary = flight.itineraries[0];
			let airline = getAirlineName(iata) + "<br>" + route;
			listing.appendChild(createGenericElement(airline, "div"));
			let time = formatDuration(itinerary.duration) + "<br>" + itinerary.segments.map(seg => formatTime(seg.departure.at) + " - " + formatTime(seg.arrival.at)).join("<br>");
			listing.appendChild(createGenericElement(time, "div"));
			listing.appendChild(createGenericElement(appendUnits(getNumberStops(itinerary), "stop"), "div"));
			let price = "$" + flight.price.grandTotal + "<br>" + (oneWay ? "one way" : "round trip");
			listing.appendChild(createGenericElement(price, "div"));
			return container;
		});
	if (newListings.length > 0) {
		listings.replaceChildren(...newListings);
	} else {
		listings.innerHTML = "No results found!";
	}
}

function selectFlight(listing) {
	
	let flight = flights[listing.dataset.index];
	localStorage.setItem(addPage("iata"), flight.validatingAirlineCodes[0].toLowerCase());
	localStorage.setItem(addPage("number"), flight.itineraries[0].segments.map(seg => seg.number).join(","));
	localStorage.setItem(addPage("name"), formatFlightName(flight));
	localStorage.setItem(addPage("info"), formatFlightInfo(flight));
	localStorage.setItem(addPage("price"), flight.price.grandTotal);
	window.location.href="./cards.html";
}

function formatDuration(raw) {
	
	return [...raw.matchAll(/\d+[A-Z]/g)].join(" ").toLowerCase();
}

function formatTime(time) {
	
	time = new Date(time);
	let hours = time.getHours();
	let suffix = hours >= 12 ? " PM" : " AM";
	hours = hours % 12;
	hours = hours ? hours : 12;
	let minutes = time.getMinutes();
	minutes = minutes < 10 ? "0" + minutes : minutes;
	return hours + ":" + minutes + suffix;
}

function formatFlightName(flight) {
	
	return getAirlineName(flight.validatingAirlineCodes[0]);
}

function formatFlightInfo(flight) {
	
	let segments = flight.itineraries[0].segments;
	let numbers = segments.map(seg => seg.number);
	numbers = (numbers.length > 1 ? "Flights #" :  "Flight #") + numbers.join(", #");
	let stops = [segments[0].departure.iataCode].concat(segments.map(seg => seg.arrival.iataCode)).join(" → ");
	let time = formatTime(segments[0].departure.at) + " - " + formatTime(segments[segments.length - 1].arrival.at);
	return [numbers, stops, time].join("<br>");
}

function getNumberStops(itinerary) {
	
	return itinerary.segments.reduce((acc, curr) => acc + curr.numberOfStops + 1, 0) - 1;
}

function appendUnits(value, units) {
	
	let out = value + " " + units;
	if (value != 1) {
		out += "s";
	}
	return out;
}

function getAirlineName(iata) {
	
	return titleCase(carrierDetails[iata.toUpperCase()]);
}