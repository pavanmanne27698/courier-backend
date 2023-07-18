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
        },
        pickupLocation: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        deliveryLocation: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        pickupDateTime: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        deliveredDateTime: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        pickedupDateTime: {
            type: Sequelize.DATE,
            allowNull: true,     
        },
        isDeliveredInTime: {
            type: Sequelize.BOOLEAN,
            allowNull: true, 
        },
        deliveryBoyPoints: {
            type: Sequelize.STRING,
            allowNull: true,
        },
    },
    {
     timestamps: true, 
    }
    );
  
    return Order;
  };