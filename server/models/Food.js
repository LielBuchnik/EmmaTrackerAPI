module.exports = (sequelize, DataTypes) => {
  const Food = sequelize.define('Food', {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    notes: { // New notes field
      type: DataTypes.TEXT,
      allowNull: true, // Notes can be optional
    },
    babyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Babies',
        key: 'id',
      },
    },
  });

  Food.associate = (models) => {
    Food.belongsTo(models.Baby, { foreignKey: 'babyId' });
    Food.belongsTo(models.Baby, { foreignKey: 'babyId', as: 'baby' });
  };

  return Food;
};
