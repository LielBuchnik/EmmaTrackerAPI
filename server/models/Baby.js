module.exports = (sequelize, DataTypes) => {
  const Baby = sequelize.define('Baby', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    birthdate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM('boy', 'girl'),
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT, // Store the image as a base64 string
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  });

  Baby.associate = (models) => {
    Baby.hasMany(models.Food, { as: 'foods', foreignKey: 'babyId' });
    Baby.hasMany(models.BloodSugar, { as: 'bloodSugars', foreignKey: 'babyId' });
    Baby.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Baby;
};
