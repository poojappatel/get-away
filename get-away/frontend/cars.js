//Rental car preferences
// let preferences = {
        //   currency:"USD",
        //   locale:"en-us",
        //   drop_off_latitude:"50.08773",
        //   drop_off_longitude:"14.421133",
        //   sort_by:"price_low_to_high", 
        //   drop_off_datetime: "2023-06-30 16:00:00",
        //   pick_up_latitude:"50.08773",
        //   pick_up_longitude:"14.421133",
        //   pick_up_datetime:"2023-06-29 16:00:00",
        //   from_country: "it"
    // };

// let origin = document.getElementById('start-place');
// let destination = document.getElementById('end-place');
// let departDate = document.getElementById('depart-date');
// let returnDate = document.getElementById('return-date');
let rentalCarData = [];
let carData = [];
let uberLyftData = [];
let uberLyftHotel = [];
let uberLyftPOI = [];

let pickUpTime = document.getElementById('pick-up-time');
let dropOffTime = document.getElementById('drop-off-time');

let lyftRideType = {
    "Lyft": 4,
    "Lyft XL": 6,
    "Lux": 4, 
    "Lux Black": 4, 
    "Lux XL": 6, 
    "Lux Black XL": 6,
    "Scooter": 1, 
    "Bikes": 1,
}
let lyftType = Object.keys(lyftRideType)

let chosen = [];
if(localStorage.hasOwnProperty("chosenVehicle") && JSON.parse(localStorage.getItem("chosenVehicle")).length !== 0)
{
	chosen = JSON.parse(localStorage.getItem("chosenVehicle"));
}

const filters = [
	filterBySeats,
    filterByPrice,
];

async function fetchRentalCars() {
    //debugger;
    let extracted = [];
    let package = {
        currency: 'USD',
        locale:"en-us",
        drop_off_latitude: localStorage.getItem("destination_latitude"), // airport or hotel location or user input??
        drop_off_longitude: localStorage.getItem("destination_longitude"), // airport or hotel location or user input??
        drop_off_datetime: document.getElementById("drop-off-date").value + " " + document.getElementById("drop-off-time").value + ":00", //"2023-06-30 16:00:00", // user input
        sort_by:"price_low_to_high", // user filter
        pick_up_latitude: localStorage.getItem("destination_latitude"), // destination airport location
        pick_up_longitude: localStorage.getItem("destination_longitude"), // destination airport location
        pick_up_datetime: document.getElementById("pick-up-date").value + " " + document.getElementById("pick-up-time").value + ":00", // arrival date from flight or user input??
        from_country: "it", // get from flight destination
    };
    

    console.log(package);
    //debugger;
    let response = await fetch('/rentalCar-preferences', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(package)
    })
    debugger;
    console.log(response.body);
    if (response === undefined  || response.body === undefined || response.body.locked) {
        return extracted
    } else {
        extracted = await response.json();
    }

    return extracted;
}

async function fetchUberLyft(preferences) {

	
    let type = typeof preferences.origin.latitude;
    console.log(preferences)

	try 
	{
		let response = await fetch('/uberlyft-preferences', {
			method: 'POST',
			headers: {
			'Content-Type': 'application/json'
			},
			body: JSON.stringify(preferences)
		});
		let extracted = await response.json();
        //console.log(extracted);

        if (extracted.Uber) {
            (extracted.Uber).map(el => el.push("https://logos-world.net/wp-content/uploads/2020/05/Uber-Logo.png"));
        }
        if (extracted.Lyft) {
            (extracted.Lyft).map(el => {
                el.push((lyftType.includes(el[0])) ? lyftRideType[el[0]] : 4 )
                el.push("https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Lyft_logo.svg/2560px-Lyft_logo.svg.png")       
            });
        }

        if (!(document.getElementById("uber").checked) && !(document.getElementById("lyft").checked)) {
            extracted = [];
        } else if (document.getElementById("uber").checked && !(document.getElementById("lyft").checked)) {
            extracted = extracted.Uber;
        } else if (!(document.getElementById("uber").checked) && document.getElementById("lyft").checked) {
            extracted = extracted.Lyft;
        } else {
            extracted = (extracted.Uber).concat(extracted.Lyft);
        }

        //console.log(extracted);
        return extracted; 
	} 
	catch(error) 
	{
		console.error('ERROR IN FETCHING DATA: ', error);
	}
}

// debugger;
// fetchUberLyft();

// price, sortby (low-high, recommend), type


function filterBySeats(){
    let numSeat = getRadioValue("seats"); 
    return vehicle => {
        if(Array.isArray(vehicle)){
            return numSeat <= vehicle[2]
        }
        else{
            return numSeat <= vehicle["vehicle_info"]["seats"]
        }
    }
}

function filterByPrice(){
    let values = getDoubleRangeValues("price");
    if(!values.min)
    {
        values.min = 0;
    }
    if(!values.max)
    {
        values.max = localStorage.getItem("budget");
    }

    return vehicle => {
        if(Array.isArray(vehicle)){
            let min = (vehicle[1].includes("-")) ? Number(vehicle[1].split("-")[0].substring(1)) : Number(vehicle[1].split("$")[1]);
            let max = (vehicle[1].includes("-")) ? Number(vehicle[1].split("-")[1]): Number(localStorage.getItem("budget"))

            return (values.min <= max && max <= values.max) || (values.min <= min && min <= values.max);
        }
        else{
            return (values.min <= vehicle["pricing_info"]["price"]) && (vehicle["pricing_info"]["price"] <= values.max)
        }
    }
}

function formatData(car, listing, src, labelHTML, seatsHTML, priceHTML) {
    let icon = document.createElement("img");
    icon.src = src;
    icon.width = 150
    icon.height = 100;
    listing.appendChild(icon);

    let label = document.createElement("div");
    console.log(car.length)
    if (car.length === 5 && car[4].includes("Airport ↔ Hotel")) {
        label.innerHTML = labelHTML + '<br>' + car[4] + '<br>';
    } else {
        label.innerHTML = labelHTML;
    }
    
    label.style.fontSize = 'large';
    label.style.fontWeight = 'bold';
    listing.appendChild(label);

    let seats = document.createElement("div");
    seats.innerHTML = seatsHTML;
    listing.appendChild(seats);
    
    let price = document.createElement("div");
    price.innerHTML = priceHTML;
    listing.appendChild(price);
}


function merge(array1, array2) {
    result = [array1, array2]
        .reduce((res, cur) => (cur.forEach((cur, i) => (res[i] = res[i] || []).push(cur)), res), [])
        .reduce((a, b) => a.concat(b));
    return result;
}

async function loadCars(budget)
{
	let listings = document.querySelector("#listings");
	if (!listings) {
		return;
	}

    let elements = carData;
    let predicates = filters.map(supplier => supplier(budget));

    elements = elements.filter(car => predicates.every(p => p(car)))
        .map((car) => {
            let container = document.createElement("li");
            container.classList.add("listing-container");
            let listing = document.createElement("div");
            container.addEventListener("click", () => selectVehicle(listing));
            listing.classList.add("listing");
            container.appendChild(listing);
            listing.dataset.index = car.index;
            listing.style.display = "flex";
            listing.style.alignItems = "center";

            if (!Array.isArray(car)) { 
                formatData(car, listing,
                car.vehicle_info.image_thumbnail_url, car["vehicle_info"]["label"].replace(" with:", "") + " similar to " + car["vehicle_info"]["v_name"] + "<br>", 
                car["vehicle_info"]["seats"] + " seats" + "<br><br>"  + car["vehicle_info"]["mileage"].replace(" km", "") + " mileage" + "<br><br>" + car["vehicle_info"]["transmission"] + "<br>", 
                "$" + car["pricing_info"]["price"] + "<br>");             
            } else {
                formatData(car, listing, car[3], car[0] + "<br>", car[2] + " seats"+ "<br>", car[1] + "<br>");
            }
            return container;
        });

	if (elements.length > 0) {
		listings.replaceChildren(...elements);
	} else {
		listings.innerHTML = "No results found!";
	}
}

// only use this if you know localStorage.getItem("transportation_destination") exists
function airportGeoLoc(name) {
	
	return amadeusToken().then(token => fetch(`https://test.api.amadeus.com/v1/reference-data/locations/airports?sort=distance&latitude=${localStorage.getItem(name + "_latitude")}&longitude=${localStorage.getItem(name + "_longitude")}`, {headers: {'Authorization': token}}))
		.then(response => response.json())
		.then(body => (body?.data).find(item => item.iataCode === localStorage.getItem("transportation_destination"))?.geoCode)
}

async function selectVehicle(listing) {
debugger;
    let vehicle = carData[listing.dataset.index];
	let price = vehicle.pricing_info?.price;
	if (!price) {
		if (vehicle[1]) {
			let range = vehicle[1].replace(/\$|\s/g, '').split('-').map(parseFloat);
			price = range.reduce((a, b) => a + b) / range.length;
		} else {
			price = 0;
		}
	}
	vehicle.price = price;
	localStorage.setItem("cars_price", price + parseFloat(localStorage.getItem("cars_price") ?? "0"));
    if (Array.isArray(vehicle) && !chosen.some(obj => (Array.isArray(obj) && obj.length !== 0) ? (obj[0] === vehicle[0] && obj[1] === vehicle[1]) : false))
            chosen.push(vehicle);
    if (!Array.isArray(vehicle) && !chosen.some(obj => (!Array.isArray(obj) && obj.length !== 0) ? (obj["vehicle_info"]["label"] === vehicle["vehicle_info"]["label"] && obj["pricing_info"]["price"] === vehicle["pricing_info"]["price"]) : false))
        chosen.push(vehicle);
    carData.splice(listing.dataset.index, 1);
    carData.forEach((listing, i) => listing.index = i);
	await loadCars(parseInt(document.getElementById("budget").value));
	loadStartData();

}

function getMinDate() {
    return localStorage.getItem("depart-date")
}

function backUpdate() {
	chosen.forEach((listing, i) => listing.index = i);
	localStorage.setItem("chosenVehicle", JSON.stringify(chosen));
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild;
}

document.addEventListener("DOMContentLoaded", function() {
    let button = document.getElementById("find-rides-button");
    button.addEventListener("click", async function() {
        let loading = '<img src="https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gifz" style="padding: 3.5em" alt="Loading listings..." width="50" height="50">'
        let element = createElementFromHTML(loading)
        document.getElementById("listings").replaceChildren(element)

        console.log("GETTING DATA FROM RENTAL CAR API");
        //debugger;
        if (document.getElementById("rental").checked) {
            console.log("GETTING DATA FROM RENTAL CAR API");
            rentalCarData = await fetchRentalCars();
        }

        console.log("GETTING DATA FROM UBER/LYFT API");

        let preferences = {
            "origin": {
                "latitude": Number(localStorage.getItem("destination_latitude")),
                "longitude": Number(localStorage.getItem("destination_longitude")), 
            },
            "destination": {
                "latitude": Number(localStorage.getItem("destination_latitude")), // need to change based on user inputs
                "longitude": Number(localStorage.getItem("destination_longitude")), // need to change based on user inputs
            }
        };

        //debugger;
        uberLyftData = await fetchUberLyft(preferences);

        if (localStorage.getItem("transportation_destination") !== null && localStorage.getItem("transportation_iata") !== null) {
            let airportLongLat = await airportGeoLoc("destination");
            //debugger;
            preferences.origin.latitude = Number(airportLongLat.latitude);
            preferences.origin.longitude = Number(airportLongLat.longitude);
            
            if (localStorage.getItem("lodging_latitude") !== null && localStorage.getItem("lodging_longitude") !== null) {
                preferences.destination.latitude = Number(localStorage.getItem("lodging_latitude"));
                preferences.destination.longitude = Number(localStorage.getItem("lodging_longitude"));

                uberLyftHotel = await fetchUberLyft(preferences);
            }
        }
        
        if (uberLyftHotel.length !== 0) {
            uberLyftHotel.forEach(el => el.push("Airport ↔ Hotel"))
            uberLyftData = uberLyftData.concat(uberLyftHotel)
        }
        
        if (rentalCarData.length !== 0 && uberLyftData.length !== 0) {
            carData = merge(rentalCarData, uberLyftData);
        } else if (rentalCarData.length === 0 && uberLyftData.length !== 0) {
            carData = uberLyftData;
        } else if (rentalCarData.length !== 0 && uberLyftData.length === 0) {
            carData = rentalCarData;
        }
        //debugger;
        carData.forEach((car, i) => car.index = i);

        await loadCars(parseInt(document.getElementById("budget").value));
    });
});