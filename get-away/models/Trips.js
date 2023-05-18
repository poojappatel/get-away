const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Trips', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    budget: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    departing_grouped_flights_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'GroupedFlights',
        key: 'group_id'
      }
    },
    returning_grouped_flights_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'GroupedFlights',
        key: 'group_id'
      }
    },
    depart_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    return_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    num_people: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    chosenPOI: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cars_price: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    chosenVehicle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    transportation_info: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Trips',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "trips_departing_grouped_flights_id_index",
        using: "BTREE",
        fields: [
          { name: "departing_grouped_flights_id" },
        ]
      },
      {
        name: "trips_returning_grouped_flights_id_index",
        using: "BTREE",
        fields: [
          { name: "returning_grouped_flights_id" },
        ]
      },
    ]
  });
};
