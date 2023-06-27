module.exports = (sequelize, Sequelize) => {
    const Order = sequelize.define("order", {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        timeForDelivery: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        distance: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        cost: {
            type: Sequelize.STRING,
            allowNull: false,
        }
    },
    {
     timestamps: true, 
    }
    );
  
    return Order;
  };