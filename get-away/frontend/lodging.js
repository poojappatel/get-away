let lodgingData = [];
let currRadio = "ALL_INCLUSIVE";
let room_type_list = ["ROOM_ONLY", "BREAKFAST", "HALF_BOARD", "FULL_BOARD", "ALL_INCLUSIVE"];

const filters = [
	getPricePred
];

function getPricePred(budget) {
	let values = getDoubleRangeValues("price");
    if(!values.min)
    {
        values.min = 0;
    }
    if(!values.max)
    {
        values.max = budget;
    }

    return lodging => values.min <= lodging["offers"]["0"]["price"]["total"] && 
            lodging["offers"]["0"]["price"]["total"] <= values.max;
}

async function getLodging()
{

    let package = {
        location: { 
            latitude: localStorage.getItem("destination_latitude"),
            longitude: localStorage.getItem("destination_longitude") 
        },
        adults: localStorage.getItem("people").toString(),
        checkInDate: localStorage.getItem("depart"),
        checkOutDate: localStorage.getItem("return"),
        roomQuantities: document.getElementById("room-count").value,
        board_type: currRadio,
        currency: 'USD'
    };

    console.log(package);

    let response = await fetch('/lodging-preferences', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(package)
    });
    let extracted = await response.json();

	sorted = extracted.sort((a, b) => parseFloat(a["offers"]["0"]["price"]["total"]) - parseFloat(b["offers"]["0"]["price"]["total"]));
    console.log(sorted);

    return sorted;
}

async function loadLodging(budget)
{
	let listings = document.querySelector("#listings");
	if (!listings) {
		return;
	}

    let elements = lodgingData;
    let predicates = filters.map(supplier => supplier(budget));
    elements = elements.filter(lodging => predicates.every(p => p(lodging)))
        .map((lodging) => {
            let container = document.createElement("li");
            container.classList.add("listing-container");
            let listing = document.createElement("div");
            container.addEventListener("click", () => selectLodging(listing));
            listing.classList.add("listing");
            container.appendChild(listing);
            listing.dataset.index = lodging.index;

            let nameAndBeds = lodging.hotel.name;
            let room = lodging["offers"]["0"]["room"];
            if("typeEstimated" in room)
            {
                let roomBeds = lodging["offers"]["0"]["room"]["typeEstimated"];
                {
                    if("beds" in roomBeds && "bedType" in roomBeds)
                    {
                        let bedType = roomBeds["bedType"].toLowerCase();
                        bedType = bedType.charAt(0).toUpperCase() + bedType.slice(1);
                        let beds = roomBeds["beds"].toString() + " " + bedType + " bed(s)";
                        nameAndBeds += "<br>" + beds;
                    }
                }
            }
            listing.appendChild(createGenericElement(nameAndBeds, "div"));
            
            let price = "$" + lodging["offers"]["0"]["price"]["total"] + "<br>" + "total";
            listing.appendChild(createGenericElement(price, "div"));

            return container;
        });

	if (elements.length > 0) {
		listings.replaceChildren(...elements);
	} else {
		listings.innerHTML = "No results found!";
	}
}

function selectLodging(listing) {
	
	let lodging = lodgingData[listing.dataset.index];
    debugger;
    console.log(lodging);
	localStorage.setItem("lodging_name", lodging["hotel"]["name"]);
    localStorage.setItem("lodging_info", formatLodgingInfo(lodging));
	localStorage.setItem("lodging_price", lodging["offers"]["0"]["price"]["total"]);
    localStorage.setItem("lodging_latitude", lodging["hotel"]["latitude"]);
    localStorage.setItem("lodging_longitude", lodging["hotel"]["longitude"]);
	window.location.href="./cards.html";
}

function formatLodgingInfo(lodging) {
    let beds = "";
    let room = lodging["offers"]["0"]["room"];
    if("typeEstimated" in room)
    {
        let roomBeds = lodging["offers"]["0"]["room"]["typeEstimated"];
        {
            if("beds" in roomBeds && "bedType" in roomBeds)
            {
                let bedType = roomBeds["bedType"].toLowerCase();
                bedType = bedType.charAt(0).toUpperCase() + bedType.slice(1);
                beds = roomBeds["beds"].toString() + " " + bedType + " bed(s) per room";
            }
        }
    }

    let numRoomsElem = document.getElementById("room-count").value === '' ? 1 : document.getElementById("room-count").value;
    let numRooms = numRoomsElem + " room(s)";
    let date = formatDate(lodging["offers"]["0"]["checkInDate"]) + " to " + 
                formatDate(lodging["offers"]["0"]["checkOutDate"]);
	//let price = "$" + lodging["offers"]["0"]["price"]["total"] + " total";

    if(beds === "")
    {
        return [date, numRooms].join("<br>");
    }
	return [date, numRooms, beds].join("<br>");
}

function formatDate(date) {
    // let obj = new Date(date);
    // let options = { month: 'long', day: 'numeric', year: 'numeric' };
    // return obj.toLocaleDateString('en-US', options);

    let months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];  
    let elems = date.split("-");
    return months[parseInt(elems[1]) - 1] + " " + elems[2] + ", " + elems[0];
}

function formatNewDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-').toString();
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild;
}

document.addEventListener("DOMContentLoaded", function() {
    let button = document.getElementById("find-lodging-button");
    button.addEventListener("click", async function() {
        let loading = '<img src="https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gifz" style="padding: 3.5em" alt="Loading listings..." width="50" height="50">'
        let element = createElementFromHTML(loading)
        document.getElementById("listings").replaceChildren(element)
        
        localStorage.setItem("return",  document.getElementById("check-out").value)
        if(localStorage.getItem("one-way") && localStorage.getItem("return") < localStorage.getItem("depart")){
            let next_date = new Date(localStorage.getItem("depart"))
            next_date.setDate(next_date.getDate() + 5)
            localStorage.setItem("return", formatNewDate(next_date))     
        }

        let radios = document.querySelectorAll('input[name="board"]');
        for(let i in radios)
        {
            if(radios[i].checked)
            {
                if(room_type_list[i] !== currRadio)
                {
                    console.log("RADIO CHANGE");
                    currRadio = room_type_list[i];
                    lodgingData = await getLodging();
                }
                break;
            }
        }
        console.log(currRadio);
        
        if(lodgingData.length === 0)
        {
            console.log("GETTING DATA FROM API");
            lodgingData = await getLodging();
        }

        lodgingData.forEach((lodging, i) => lodging.index = i);

        await loadLodging(parseInt(document.getElementById("budget").value));
    });
});