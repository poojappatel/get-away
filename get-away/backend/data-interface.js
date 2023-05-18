const API = require('./api.js');
const Database = require('./database.js');
const WebScrape = require('./web-scrape.js');

class DataInterface 
{
    constructor() 
    {
        // set up the database interface
        this.db = new Database();
        // to get data from APIs
        this.api = new API();
        this.scrape = new WebScrape();
    }

    async initDatabase()
    {
        let success = await this.db.initDatabase()
        if (success) {
            console.log('Database successfully initialized')
        }
    }
    /*
    Sample input:
        budget: "500"
        depart: "2023-04-28"
        destination: "BOS"
        one-way: "false"
        origin: "MCO"
        people: "1"
        return: "2023-04-30"
        transportation_iata: "nk"
        transportation_info: "Flight #103<br>4:00 PM - 7:01 PM<br>Nonstop<br>$145.78"
        transportation_name: "Spirit Airlines"
        transportation_price: "145.78"
    */

    // convert YYYY-MM-DD to JavaScript datetime object
    make_datetime_object(str) {
        return Date.parse(str)
    }

    async createTrip(info)
    {
        let reformatted = {}
        reformatted['Trips'] = {
            budget: info['budget'],
            depart_date: this.make_datetime_object(info['depart']),
            return_date: this.make_datetime_object(info['return']),
            location: info['destination'],
            num_people: info['people'],
            transportation_info: info['transportation_info']
        }
        if (Object.keys(info).includes('transportation_name')) {
            reformatted['Flights'] = {
                'departing': [
                    {
                        airline_name: info['transportation_name'],
                        airline_iata: info['transportation_iata'],
                        flight_number: info['transportation_number'], 
                        // flight_number: '3',
                        departure_time: this.make_datetime_object(info['depart']), // these might be different in the future
                        arrival_time: this.make_datetime_object(info['return']), //
                        departure_location: info['origin'],
                        arrival_location: info['destination'],
                        price: info['transportation_price']
                    }
                ],
                'returning': [
                    // How can I tell if there are returning flights?
                    // no returning
                ]
            }
        }
        
        if (Object.keys(info).includes('lodging_info')) {
            reformatted['Lodgings'] = {
                name: info['lodging_name'],
                lodging_info: info['lodging_info'],
                price: info['lodging_price']
            }
        }

        if (Object.keys(info).includes('chosenPOI')) {
            reformatted['Trips']['chosenPOI'] = info['chosenPOI']
        }

        if (Object.keys(info).includes('cars_price')) {
            reformatted['Trips']['cars_price'] = info['cars_price']
        }

        if (Object.keys(info).includes('chosenVehicle')) {
            reformatted['Trips']['chosenVehicle'] = info['chosenVehicle']
        }

        let result = await this.db.createTrip(reformatted)

        // if it was successful
        if (result.success) {
            return result.value
        } else {
            return false
        }
    }

    async getTrip(tripID)
    {
        let allInfo = await this.db.getTrip(tripID)
        let trip = allInfo['Trips']

        // handle trip
        let one_way = allInfo['Flights']['returning'].length == 0 ? true : false
        
        // ! this doesn't work for multiple flights, assuming one for now
        let flight = allInfo['Flights']['departing'][0]
        let origin = flight.departure_location
        
        let response = {
            'budget': trip.budget,
            'depart': trip.depart_date.toISOString().substring(0, 10), // toISOString() returns it in YYYY-MM-DD format, just take first 10 characters
            'destination': trip.location,
            'one-way': one_way,
            'origin': origin,
            'people': trip.num_people,
            'return': (trip.return_date != null) ? trip.return_date.toISOString().substring(0, 10) : null, // toISOString() returns it in YYYY-MM-DD format, just take first 10 characters
            'transportation_iata': flight.airline_iata,
            'transportation_name': flight.airline_name,
            'transportation_price': flight.price,
            'transportation_info': trip.transportation_info,
        }

        if (Object.keys(allInfo).includes('Lodgings')) {
            let lodging = allInfo['Lodgings']
            response['lodging_price'] = lodging.price
            response['lodging_name'] = lodging.name
            response['lodging_info'] = lodging.lodging_info
        }
        if (Object.keys(trip).includes('chosenPOI')) {
            response['chosenPOI'] = trip['chosenPOI']
        }

        if (Object.keys(trip).includes('cars_price')) {
            response['cars_price'] = trip['cars_price']
        }

        if (Object.keys(trip).includes('chosenVehicle')) {
            response['chosenVehicle'] = trip['chosenVehicle']
        }

        return response
    }
    
    async getFlights(preferences) 
    {
        try 
        {
            let flights = await this.api.getFlights(preferences);
            return flights;
        } 
        catch(error) 
        {
            console.error('ERROR IN FETCHING FLIGHTS: ', error);
        }
    }

    async getLodging(preferences) 
    {
        try 
        {
            let lodgingData = await this.api.getLodging(preferences);
            return lodgingData;
        } 
        catch(error) 
        {
            console.error('ERROR IN FETCHING LODGING DATA: ', error);
        }
    }

    async getEntertainment(preferences) 
    {
        try 
        {
            let entertainmentData = await this.api.getEntertainment(preferences);
            return entertainmentData;
        } 
        catch(error) 
        {
            console.error('ERROR IN FETCHING ENTERTAINMENT DATA: ', error);
        }
    }

    async getRestaurants(preferences) 
    {
        try 
        {
            let restaurantData = await this.api.getRestaurants(preferences);
            return restaurantData;
        } 
        catch(error) 
        {
            console.error('ERROR IN FETCHING RESTAURANT DATA: ', error);
        }
    }

    async getRentalCars(preferences) 
    {
        try 
        {
            let rentalCarData = await this.api.getRentalCars(preferences);
            return rentalCarData;
        } 
        catch(error) 
        {
            console.error('ERROR IN FETCHING RENTAL CAR DATA: ', error);
        }
    }
    
    async getUberLyft(preferences) 
    {
        try 
        {
            let uberData = await this.scrape.uberPrices(preferences);
            let lyftData = await this.scrape.lyftPrices(preferences)
            return {
                "Uber": uberData, 
                "Lyft": lyftData
            };
        } 
        catch(error) 
        {
            console.error('ERROR IN FETCHING UBER/LYFT DATA: ', error);
        }
    }
}

module.exports = DataInterface;