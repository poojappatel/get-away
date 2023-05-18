const fetch = require('node-fetch');

class WebScrape {
    async uberPrices(preferences) {
        return await fetch("https://www.uber.com/api/loadFEEstimates?localeCode=en", {
            method: 'POST',
            body: JSON.stringify({
                "origin": preferences.origin,
                "destination": preferences.destination,
                "locale": "en"
            }),
            headers: {
                'content-type': 'application/json',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
                'x-csrf-token': 'x'
            }
        })
        .then(response => response.json())
        // getting only necessary data and putting it in a nested array
        .then(
            res => (res.data.prices).map(obj => Object.hasOwn(obj, 'vehicleViewDisplayName') && Object.hasOwn(obj, 'fareString') ? [obj.vehicleViewDisplayName, obj.fareString, obj.capacity] : null)
            .filter(el =>  el != null && el !== undefined)
        )
        .catch(err => console.log(`UBER API error: ${err}`));
    }
    // Testing
    //uberPrices(42.385150, -72.525290, 42.039370, -72.613620);

    async lyftPrices(preferences) {
        let priceStr = ""
        return await fetch("https://www.lyft.com/api/costs?start_lat="+preferences.origin.latitude+"&start_lng="+preferences.origin.longitude+"&end_lat="+preferences.destination.latitude+"&end_lng="+preferences.destination.longitude)
        .then(response => response.json())
        .then(res => res.cost_estimates.map(obj => {
            if (Object.hasOwn(obj, 'estimated_cost_cents_min') && Object.hasOwn(obj, 'estimated_cost_cents_max')) {
                obj['estimated_cost_cents_min'] = obj.estimated_cost_cents_min / 100;
                obj['estimated_cost_cents_max'] = obj.estimated_cost_cents_max / 100;
                priceStr = "$"+ obj.estimated_cost_cents_min + "-" + obj.estimated_cost_cents_max;
            }
            return [obj.display_name, priceStr] // same format as uber function
        })).catch(err => console.log(`Lyft API error: ${err}`));
    }
    // Testing
    //lyftPrices(42.387119, -72.526435, 42.038042, -72.617054);
}

// let location = {
//     "origin": {
//         "latitude": 42.385150,
//         "longitude": -72.525290
//     },
//     "destination": {
//         "latitude": 42.039370,
//         "longitude": -72.613620
//     },
// }


// const test3 = new WebScrape;
// console.log(test3.uberPrices(location))
module.exports = WebScrape;