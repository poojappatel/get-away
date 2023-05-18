//to do
let listContainer = document.querySelector("#listings");
let chosen = [];
let check = true;
if(localStorage.hasOwnProperty("chosenVehicle") && JSON.parse(localStorage.getItem("chosenVehicle")).length !== 0)
{
	chosen = JSON.parse(localStorage.getItem("chosenVehicle"));
}

function loadResults()
{
    if(chosen.length !== 0)
    {
        if (check || !(chosen[0].index)) {
            chosen.forEach((car, i) => car.index = i);
            chosen.forEach((car, i) => car.index = i);
            check = false;
        } else {
        chosen.forEach((car, i) => car.index = i);
            check = false;
        }

        let elements = chosen;
        elements = elements.map((car) => {
                let container = document.createElement("li");
                container.classList.add("listing-container");
                let listing = document.createElement("div");
                container.addEventListener("click", () => removeActivity(listing));
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
        //console.log(localStorage.getItem("chosenVehicle"))
        listContainer.replaceChildren(...elements);
    }
    else
    {
        listContainer.innerText = "No cars selected!";
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

    let remove = document.createElement("div");
    remove.innerHTML = "Click to Remove";
    listing.appendChild(remove);
}

async function removeActivity(listing)
{
    let index = listing.dataset.index;

    if(Array.isArray(chosen[index])){
        let val1 = (chosen[index][1].includes("-")) ? Number(chosen[index][1].split("-")[0].substring(1)) : Number(chosen[index][1].split("$")[1]);
        let val2 = (chosen[index][1].includes("-")) ? Number(chosen[index][1].split("-")[1]): Number(chosen[index][1].split("$")[1])
        let avg = (val1 + val2)/2
        localStorage.setItem("cars_price", parseFloat(localStorage.getItem("cars_price") ?? "0") - parseFloat(avg));
    }
    else{
        localStorage.setItem("cars_price", parseFloat(localStorage.getItem("cars_price") ?? "0") - parseFloat(chosen[index]["pricing_info"]["price"]));
    }
        
    chosen.splice(index, 1);

    chosen.forEach((listing, i) => listing.index = i);
    localStorage.setItem("chosenVehicle", JSON.stringify(chosen));
    loadResults();
    loadStartData();
}
loadResults();