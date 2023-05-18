const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Transportation', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    transportation_type_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'TransportationTypes',
        key: 'id'
      }
    },
    vendor_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    departure_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    arrival_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    depature_location: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    arrival_location: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'Transportation',
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
        name: "transportation_transportation_type_id_foreign",
        using: "BTREE",
        fields: [
          { name: "transportation_type_id" },
        ]
      },
    ]
  });
};
