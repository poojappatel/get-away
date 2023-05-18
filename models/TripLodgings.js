const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('TripLodgings', {
    trip_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Trips',
        key: 'id'
      }
    },
    lodging_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Lodgings',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'TripLodgings',
    timestamps: false,
    indexes: [
      {
        name: "triplodgings_trip_id_index",
        using: "BTREE",
        fields: [
          { name: "trip_id" },
        ]
      },
      {
        name: "triplodgings_lodging_id_index",
        using: "BTREE",
        fields: [
          { name: "lodging_id" },
        ]
      },
    ]
  });
};
