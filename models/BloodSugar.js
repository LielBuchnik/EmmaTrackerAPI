module.exports = (sequelize, DataTypes) => {
    const BloodSugar = sequelize.define('BloodSugar', {
        level: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                min: 0,
                max: 500, 
            },
        },
        measurementTime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        babyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Babies',
                key: 'id',
            },
        },
        foodId: {  // This references the feeding log
            type: DataTypes.INTEGER,
            allowNull: true,  // Can be null if the blood sugar is not associated with any food
            references: {
                model: 'Food',
                key: 'id',
            },
        }
    });

    BloodSugar.associate = (models) => {
        BloodSugar.belongsTo(models.Baby, { foreignKey: 'babyId' });
        BloodSugar.belongsTo(models.Baby, { foreignKey: 'babyId', as: 'baby' });
        BloodSugar.belongsTo(models.Food, { foreignKey: 'foodId' });  // Association with Food
    };

    return BloodSugar;
};
