const { sequelize, Trips, Lodgings, Transportation, Flights, GroupedFlights, TripLodgings } =  require('../models')
class Database 
{

    async initDatabase() 
    {
      try
      {
        await sequelize.sync()
        return true
      } 
      catch(error) 
      {
        console.log('ERROR IN INITIALIZING DATABASE: ', error)
        return false
      }
    }

    async getTrips(id)
    {
      let trips = await Trips.findAll({
        where: {
          id: id
        }
      })

      return trips
    }

    /* format of trip information:
      JSON format
      first key represents table name, second key represents column and then value will be column val
      "grouped" flights will be handled differently
      EX:
      [ 
        "Trips":
        {
          "budget": 300
          "depart_date": 01-21-2201 (might need to be JS DateTime object)
          "return_date": ...
          "location": ...
          "num_people": ,,,
        }
        "Lodgings":
        {
          "name": ...
          "location" ..
        }
        "Flights":
        {
          "departing":
            [
              {
                "airline": ...,
                "flight_number": ...,
                "departure_time": ...,
                "arrival_time": ...
                these are columsn within the table
              }
            ]
          "returning":
          [

          ]
        }
      ]
    */
    async createTrip(tripInformation)
    {
      // create Trip instance first, need the ID for these other ones
      // todo: add more verification stuff here
      if (!("Trips" in tripInformation)) 
      {
        return {"success": false, "error": "Trip information not given."}
      }

      let trip = await Trips.create(tripInformation["Trips"])
      let tripID = trip.id

      for (const key in tripInformation) 
      {
        switch (key) 
        {
          case "Flights":
            let flight_info = tripInformation[key]
            for (let flight_type in flight_info) {
              // isolate list of flights
              let flights = flight_info[flight_type]
              
              // insert correspnoding flights, and also create grouped_flights
              let first_group_id = await this._insertFlights(flights)

              // update this trip's information, depending on if this was a departing or returning flight
              // create the "update" update
              let column = `${flight_type}_grouped_flights_id`
              let info = {}
              info[column] = first_group_id
            
              // do the update
              await Trips.update(
                info,
                {
                  "where": 
                  {
                    "id": tripID
                  }
                }
              )
            }
            break
          case "Transportation":
            break
          case "Lodgings":
            // format JSON correctly
            let info = tripInformation['Lodgings']
            // make call to create lodging listing
            let new_lodging = await Lodgings.create(info)
            // create the TripLodgings
            let trip_lodging_info = {
              "trip_id": tripID,
              "lodging_id": new_lodging.id,
            }
            await TripLodgings.create(trip_lodging_info)
            break
          case "Trips":
            // trips table was already made, can skip
            continue
        }
      }
      return {"success": true, "value": tripID}
    }

    // flights is array of flights
    // returns first_group_id of this group of flights
    async _insertFlights(flights) 
    {
      let first_group_id = null
      for(let idx = 0; idx < flights.length; idx++) {
        let flight = flights[idx]
        // insert row into flights table
        let new_flight = await Flights.create(flight)
        let info = {
          "flight_id": new_flight.id,
        }

        // create row in grouped flights
        let new_grouped_flight = await GroupedFlights.create(info)
        if (first_group_id === null) first_group_id = new_grouped_flight.group_id
        // update the first_group_id of this grouped_flight
        await GroupedFlights.update({
            "first_group_id": first_group_id
          },
          {
            where: {
              "group_id": new_grouped_flight.group_id
            }
          }
        )
      }
      return first_group_id
    }
  
    // for a given tripID, return the corresponding flight and all information
    // return type is JSON, where key is Table name in the backend (Trip, Lodging, etc.)
    // "second layer" key is column name, and then value is the corresponding value for that row
    // same format as the input for createTrip
    async getTrip(tripID) 
    {
      let result = {}
      // get the tripTable information
      let trip = await Trips.findByPk(tripID)
      let departing_flights = await this._getFlights(trip.departing_grouped_flights_id)
      let returning_flights = await this._getFlights(trip.returning_grouped_flights_id)
      // format flight information and trip information
      result['Trips'] = trip.dataValues

      result['Flights'] = {
        'departing': departing_flights.map((flight) => flight.dataValues), 
        'returning': returning_flights.map((flight) => flight.dataValues)
      }

      // get the Lodging information
      // find the PK in TripLodging
      let trip_lodging_instance = await TripLodgings.findAll({
        where: {
          'trip_id': tripID
        }
      })
      if (trip_lodging_instance.length != 0) {
        // get the lodging_id
        let lodging_id = trip_lodging_instance[0].lodging_id
        // go through Lodgings Table, search by that id
        let lodging_instance = await Lodgings.findByPk(lodging_id)
        // return the information from lodgings
        result['Lodgings'] = lodging_instance.dataValues
      }
      return result
    }

    // returns array of rows of the Flight table
    // the rows of Flights correspond to the ones that are associated with the grouped_flights_id
    // output ex:
    // [
    // {
    //     id: 3,
    //     airline: 'Delta',
    //     flight_number: 3023,
    //     departure_time: 2023-04-22T20:20:11.000Z,
    //     arrival_time: 2023-04-22T20:20:11.000Z,
    //     departure_location: 'NYC',
    //     arrival_location: 'BOS',
    //     price: 324
    //   },
    //   {
    //     id: 4,
    //     airline: 'Delta',
    //     flight_number: 3033,
    //     departure_time: 2023-04-22T20:20:11.000Z,
    //     arrival_time: 2023-04-22T20:20:11.000Z,
    //     departure_location: 'BOS',
    //     arrival_location: 'LAX',
    //     price: 324
    //   }
    // ]
    async _getFlights(grouped_flights_id) {
      // get the corresponding group information
      let grouped = await GroupedFlights.findAll({
        attributes: ['flight_id'],
        where: {
          first_group_id: grouped_flights_id
        },
        order: [['group_id', 'ASC']] // ASC order to preserve order of flights
      })
      // get the corresponding flight and add to array
      // ! could improve this in the future (left join)
      let flights = []
      for (let i = 0; i < grouped.length; i++) {
        flights.push(await Flights.findByPk(grouped[i].flight_id))
      }
      return flights
    }
  }
  
  module.exports = Database;  