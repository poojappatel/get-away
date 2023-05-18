const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('TransportationTrips', {
    transportation_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Transportation',
        key: 'id'
      }
    },
    trip_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Trips',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'TransportationTrips',
    timestamps: false,
    indexes: [
      {
        name: "transportationtrips_transportation_id_index",
        using: "BTREE",
        fields: [
          { name: "transportation_id" },
        ]
      },
      {
        name: "transportationtrips_trip_id_index",
        using: "BTREE",
        fields: [
          { name: "trip_id" },
        ]
      },
    ]
  });
};
