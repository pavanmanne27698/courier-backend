module.exports = (sequelize, Sequelize) => {
    const Order = sequelize.define("order_detail", {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        pickupLocation: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        deliveryLocation: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        pickupTime: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        completedTime: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        status: {
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