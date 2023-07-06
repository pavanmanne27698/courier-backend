module.exports = (sequelize, Sequelize) => {
    const Route = sequelize.define("route", {
        source: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
        destination: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        }
    });
    return Route;
  };
