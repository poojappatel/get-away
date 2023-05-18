const Amadeus = require('amadeus');
const fetch = require('node-fetch');
const poi_data = require("./poi_data.js")
const rest_data = require("./rest_data.js")

class API {
	constructor() {
		// Amadeus API connection
		this.amadeus = new Amadeus({
			clientId: 'T6ZEoU4yyWvojQHdAC4RQedwAniwbksC',
			clientSecret: 'Qdvz7aQie6QNAYXe'
		});
	}
    
    async getCityCodes(cityName) {
		try {
			let details = { keyword: cityName, subType: Amadeus.location.any }
			let response = await this.amadeus.referenceData.locations.get(details);
			// high prob that first entry is a match
			if(response.data.length != 0) {
				let elem = response.data[0];
				return { iata: elem.iataCode, cityCode: elem.address.cityCode };
			}
			return "CITY CODES NOT FOUND";
		} catch(error) {
			console.error("ERROR IN FETCHING CITY CODES DATA: ", error);
		}
	}
        
    async getFlights(preferences) {
        try {
            let response = await this.amadeus.shopping.flightOffersSearch.get(preferences);
            // console.log(response.data);
            return response;
        } catch(error) {
            console.error("ERROR IN FETCHING FLIGHT DATA: ", error);
        }
     }

    async getLodging(preferences) {
        
        // let preferences = {
        //     location: { // required
        //         latitude: 51.50988,
        //         longitude: -0.15509
        //     },
        //     // below params not required, but based on what we let user filter we can use below params
        //     adults: '2', // 1 - 9
        //     checkInDate: '2023-05-07',
        //     checkOutDate: '2023-05-10',
        //     roomQuantities: '5', // 1 - 9
        //     priceRange: '100-200', // ex: 200-300 or -300 or 100
        //     currency: 'EUR',
        //     boardType: 'ROOM_ONLY', //ROOM_ONLY = Room Only or BREAKFAST = Breakfast
        //     // bestRateOnly: 'true', // true or false
        // }
        

        //hotelIds: 'ADNYCCTB', // required
        let hotelIdsArr = [];
        return this.amadeus.referenceData.locations.hotels.byGeocode.get(preferences.location)
            .then(response => hotelIdsArr = (response.data).map(obj => Object.hasOwn(obj, 'hotelId') ? obj.hotelId : null))
                .then(() => {
                    delete preferences.location;
                    if (hotelIdsArr.length >= 150) {
                        preferences['hotelIds'] = hotelIdsArr.slice(0, 150).join();
                    }
                    else
                    {
                        preferences['hotelIds'] = hotelIdsArr.join();
                    }
                    // console.log(preferences['hotelIds']);
                    return this.amadeus.shopping.hotelOffersSearch.get(preferences)
                        .then(response => response.data)
                        .catch(err => console.error("ERROR IN FETCHING LODGING DATA:", err));
                    })
                .catch(err => console.error("ERROR IN FETCHING DATA:", err))
            .catch(err => console.error("ERROR IN FETCHING DATA:", err));
    }

    async getEntertainment(preferences) {
        /*
        preferences = {
            latitude: '41.397158', // required
            longitude: '2.160873', // required
            radius: '5' // param not required: we can actually set this ourselves, can only be 0 - 20
        }
        */
        return this.amadeus.shopping.activities.get(preferences)
            // .then(response => console.log(response.data))
            .then(response => response.data)
            .catch(err => console.error("ERROR IN FETCHING DATA:", err));
        // return poi_data;
    }
 
    async getRestaurants(preferences) {
                // let preferences = {
                //     // ALL REQUIRED
                //     q: 'PAR',
                //     language: "en_US",
                // };
                //location_id: "297704", 
                let locationID = '';
                const searchParams = new URLSearchParams();
                Object.keys(preferences).forEach(key => (key == 'q' || key == 'language') ? searchParams.append(key, preferences[key]) : null);
                const options = {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                        'X-RapidAPI-Key': '3913f922damsh21be555b5ec619bp13c54ejsna210b0e6c0c1',
                        'X-RapidAPI-Host': 'worldwide-restaurants.p.rapidapi.com'
                    },
                    body: searchParams.toString()
                };
                return await fetch('https://worldwide-restaurants.p.rapidapi.com/typeahead', options)
                    .then(response => response.json())
                    .then(response => locationID = response.results.data[0].result_object.location_id)
                    .then(async () => {
                        delete preferences.q;
                        preferences['location_id'] = locationID;
                        preferences["currency"] = "USD";
                        preferences["limit"] = "50";
                        const searchParams2 = new URLSearchParams();
                        Object.keys(preferences).forEach(key => searchParams2.append(key, preferences[key]));
                        options.body = searchParams2.toString();
                        return await fetch('https://worldwide-restaurants.p.rapidapi.com/search', options)
                            .then(response => response.json())
                            .then(response => response.results.data)
                            .catch(err => console.error(err));
                    }) .catch(err => console.error(err));
        // return rest_data;
         }

    async getRentalCars(preferences) {

        //ALL THE PARAMETRS WE NEED 
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
        //   from_country: "pl"
        // };
    
        let query =  new URLSearchParams(preferences);
    
        let url = 'https://booking-com.p.rapidapi.com/v1/car-rental/search?'+decodeURIComponent(query.toString()); 
        const options = {
          method: 'GET',
          headers: {
            'content-type': 'application/octet-stream',
            'X-RapidAPI-Key': '2c6c2eb443msh480181c2458bcdbp10edb5jsn81e8919e6c2b',
            'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
          }
        };
        
        return await fetch(url, options)
		.then(response => (response.status === 200) ? response.json() : [])
        .then(res => (res.length !== 0) ? (res.search_results.length >= 301 ? res.search_results.slice(0, 301) : res.search_results) : [])
		.catch(err => {
            console.error("ERROR IN FETCHING DATA:", err);
            return [];
        });
    }
    
    async getPublicTransit(preferences) {
        // Create the parameters for the routing request:
        var routingParameters = {
            // The start point of the route:
            origin:'41.79457,12.25473',
            // The end point of the route:
            destination:'41.90096,12.50243',
        };

        let query =  new URLSearchParams(preferences);
        let url = "https://transit.router.hereapi.com/v8/routes?apikey=FNdz8YE1AkNUN4SS2fvYdMNIezN6OJZ3HLVhgPrwzxg&"+decodeURIComponent(query.toString())
        let response = await fetch(url, {
        method: 'GET'
        }).catch(err => console.error("ERROR IN FETCHING DATA:", err));

        let data = await response.json(); 

        //console.log(data); 
        return data; 
    }
}
// let preferences = { 
//     currency: 'USD',
//     drop_off_datetime: '2023-05-25 23:30:00',
//     drop_off_latitude: '40.71417',
//     drop_off_longitude: '-74.00583',
//     from_country: 'it',
//     locale: 'en-us',
//     pick_up_datetime: '2023-05-24 19:30:00',
//     pick_up_latitude: '40.71417',
//     pick_up_longitude: '-74.00583',
//     sort_by: 'price_low_to_high'
// }

// let test5 = new API;
// console.log(test5.getRentalCars(preferences))

module.exports = API;
