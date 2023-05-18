const cards = {//TODO add others
	transportation: [
		{key: "iata", factory: (iata) => createAirlineIconElement(iata, 400, 160)},
		{key: "name", factory: (data) => createGenericElement(data, "h3")},
		{key: "info", factory: (data) => createGenericElement(data, "div")},
		{key: "price", factory: (data) => createGenericElement("$" + data, "div")}		
	],
	lodging : [
		{key: "name", factory: (data) => createGenericElement(data, "h2")},
		{key: "info", factory: (data) => createGenericElement(data, "div")},
		{key: "price", factory: (data) => createGenericElement("$" + data, "div")}
	],
	poi:[	
		{key : "name", factory: (data)=> createGenericElement(data, "h2")},
		{key : "info", factory : (data) => createGenericElement(data, "div")},
		{key: "price", factory: (data) => createGenericElement("$" + data, "div")}
	],
	cars:[	
		{key : "name", factory: (data)=> createGenericElement(data, "h2")},
		{key : "info", factory : (data) => createGenericElement(data, "div")},
		{key: "price", factory: (data) => createGenericElement("$" + data, "div")}
	]
};

loadCards();

function capitalizeFirstLetter(string) {
	
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function loadCards() {
	
	for (const [card, components] of Object.entries(cards)) {
		let id = `#${card}-card `;
		let details = document.querySelector(id + ".card-details");
		let button = document.querySelector(id + ".submit-button");
		if (!details || !button) {
			continue;
		}
		if (components.every(comp => localStorage.getItem(card + "_" + comp.key))) {
			for (const component of components) {
				details.appendChild(component.factory(localStorage.getItem(card + "_" + component.key)));
			}
			button.innerHTML = "Change " + capitalizeFirstLetter(card);
		} else {
			details.appendChild(createImageElement(`./${card}-icon.png`));
		}
	}
}

function chooseTransportation() {
	
	window.location.href="./flights.html"; //TODO change once attached to backend
}

function chooseLodging()
{
	window.location.href = "./lodging.html";
}

function chooseCars()
{
	window.location.href = "./cars_result.html";
}

function chooseActivity()
{
	window.location.href = "./poi_restaurants.html";
}