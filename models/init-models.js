var DataTypes = require("sequelize").DataTypes;
var _Flights = require("./Flights");
var _GroupedFlights = require("./GroupedFlights");
var _Lodgings = require("./Lodgings");
var _Transportation = require("./Transportation");
var _TransportationTrips = require("./TransportationTrips");
var _TransportationTypes = require("./TransportationTypes");
var _TripLodgings = require("./TripLodgings");
var _Trips = require("./Trips");

function initModels(sequelize) {
  var Flights = _Flights(sequelize, DataTypes);
  var GroupedFlights = _GroupedFlights(sequelize, DataTypes);
  var Lodgings = _Lodgings(sequelize, DataTypes);
  var Transportation = _Transportation(sequelize, DataTypes);
  var TransportationTrips = _TransportationTrips(sequelize, DataTypes);
  var TransportationTypes = _TransportationTypes(sequelize, DataTypes);
  var TripLodgings = _TripLodgings(sequelize, DataTypes);
  var Trips = _Trips(sequelize, DataTypes);

  GroupedFlights.belongsTo(Flights, { as: "flight", foreignKey: "flight_id"});
  Flights.hasMany(GroupedFlights, { as: "GroupedFlights", foreignKey: "flight_id"});
  Trips.belongsTo(GroupedFlights, { as: "departing_grouped_flight", foreignKey: "departing_grouped_flights_id"});
  GroupedFlights.hasMany(Trips, { as: "Trips", foreignKey: "departing_grouped_flights_id"});
  Trips.belongsTo(GroupedFlights, { as: "returning_grouped_flight", foreignKey: "returning_grouped_flights_id"});
  GroupedFlights.hasMany(Trips, { as: "returning_grouped_flights_Trips", foreignKey: "returning_grouped_flights_id"});
  TripLodgings.belongsTo(Lodgings, { as: "lodging", foreignKey: "lodging_id"});
  Lodgings.hasMany(TripLodgings, { as: "TripLodgings", foreignKey: "lodging_id"});
  TransportationTrips.belongsTo(Transportation, { as: "transportation", foreignKey: "transportation_id"});
  Transportation.hasMany(TransportationTrips, { as: "TransportationTrips", foreignKey: "transportation_id"});
  Transportation.belongsTo(TransportationTypes, { as: "transportation_type", foreignKey: "transportation_type_id"});
  TransportationTypes.hasMany(Transportation, { as: "Transportations", foreignKey: "transportation_type_id"});
  TransportationTrips.belongsTo(Trips, { as: "trip", foreignKey: "trip_id"});
  Trips.hasMany(TransportationTrips, { as: "TransportationTrips", foreignKey: "trip_id"});
  TripLodgings.belongsTo(Trips, { as: "trip", foreignKey: "trip_id"});
  Trips.hasMany(TripLodgings, { as: "TripLodgings", foreignKey: "trip_id"});

  return {
    Flights,
    GroupedFlights,
    Lodgings,
    Transportation,
    TransportationTrips,
    TransportationTypes,
    TripLodgings,
    Trips,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
