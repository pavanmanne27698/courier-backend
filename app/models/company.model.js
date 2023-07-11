module.exports = (sequelize, Sequelize) => {
    const Company = sequelize.define("company", {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        location: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
        }
    },
    {
        timestamps: false, 
    }
    );
    return Company;
  };