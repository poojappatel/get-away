let listContainer = document.querySelector("#listings");
let chosen = [];
if(localStorage.hasOwnProperty("chosenPOI") && JSON.parse(localStorage.getItem("chosenPOI")).length !== 0)
{
	chosen = JSON.parse(localStorage.getItem("chosenPOI"));
}

function loadResults()
{
    if(chosen.length !== 0)
    {
        let elements = chosen;
        elements = elements.map((elem) => {
            let container = document.createElement("li");
            container.classList.add("listing-container");
            container.addEventListener("click", () => removeActivity(listing));
            let listing = document.createElement("div");
            listing.classList.add("listing");
            container.appendChild(listing);
            listing.dataset.index = elem.index;

			let details = '';
			details += `<span class="poi-name">${elem.name.toUpperCase()}</span><br>`
			if(elem.type)
			{
				details += "Categories: " + elem.shortDescription + "<br>";
				details += `<a href=${elem.bookingLink}>Make Reservation</a>`
			}
			else
			{
				details += elem.address + "<br>"
				if(elem.neighborhood_info)
				{
					let neighbors = '';
					for(let obj of elem.neighborhood_info)
					{
						neighbors += obj.name + ", "
					}
					neighbors = neighbors.substring(0, neighbors.length - 2);
					details += neighbors + "<br>";
				}
				details += "<br>";
				if(elem.email)
					details += "Contact: " + elem.email + "<br>";
				details += `<a href=${elem.website}>Visit Website</a>`
			}
			let detailsPack = createGenericElement(details, "div");
			detailsPack.classList.add("details-pack");
			
			let img = document.createElement("img");
			if(elem.type)
				img.setAttribute("src", elem.pictures[0]);
			else
				img.setAttribute("src", elem.photo.images.original.url);
			img.setAttribute("alt", "POI Image");
			img.classList.add("small-pic");

			listing.appendChild(detailsPack);
			if(!elem.type)
			{
				let rankDetails = elem.ranking + "<br>";
				rankDetails += "Price: " + elem.price_level + "<br><br>"
                rankDetails += `<span style="opacity: 0.5;">(Click to remove)</span>`
				rankPack = createGenericElement(rankDetails, "div")
				rankPack.classList.add("rank-pack");
				listing.appendChild(rankPack);
			}
            else
            {
                let rankDetails = `<span style="opacity: 0.5;">(Click to remove)</span>`
				rankPack = createGenericElement(rankDetails, "div")
				rankPack.classList.add("rank-pack");
				listing.appendChild(rankPack);
            }
			listing.appendChild(img);

            return container;
        });

        listContainer.replaceChildren(...elements);
    }
    else
    {
        listContainer.innerText = "No activities selected!";
    }
}

async function removeActivity(listing)
{
	let index = listing.dataset.index;
	localStorage.setItem("poi_price", parseFloat(localStorage.getItem("poi_price") ?? "0") - chosen[index].sortPrice);
	chosen.splice(index, 1);
	chosen.forEach((listing, i) => listing.index = i);
    localStorage.setItem("chosenPOI", JSON.stringify(chosen));
	loadResults();
	loadStartData();
}

loadResults();