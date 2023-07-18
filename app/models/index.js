const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.session = require("./session.model.js")(sequelize, Sequelize);
db.user = require("./user.model.js")(sequelize, Sequelize);
db.customer = require("./customer.model.js")(sequelize, Sequelize);
db.order = require("./order.model.js")(sequelize, Sequelize);
db.route = require("./route.model.js")(sequelize, Sequelize);
db.company = require("./company.model.js")(sequelize, Sequelize);

// foreign key for session
db.user.hasMany(
  db.session,
  { as: "session" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);
db.session.belongsTo(
  db.user,
  { as: "user" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);

//foreign key for company
db.company.hasMany(db.user, {
  foreignKey: {
    name: 'companyId',
    allowNull: true,
  },
  onDelete: 'CASCADE',
});
db.user.belongsTo(db.company, {
  foreignKey: 'companyId',
  as: 'companyDetails',
  onDelete: 'CASCADE',
});
db.company.hasMany(db.order, {
  foreignKey: {
    name: 'companyId',
    allowNull: true,
  },
  onDelete: 'CASCADE',
});
db.order.belongsTo(db.company, {
  foreignKey: 'companyId',
  as: 'companyDetails',
  onDelete: 'CASCADE',
});


// Foreign key for User
db.user.hasMany(db.order, {
  foreignKey: {
    name: 'placedByUserId',
    allowNull: true,
  },
  onDelete: 'CASCADE',
});
db.user.hasMany(db.order, {
  foreignKey: {
    name: 'deliveryBoyUserId',
    allowNull: true,
  },
  onDelete: 'CASCADE',
});
db.order.belongsTo(db.user, {
  foreignKey: 'placedByUserId',
  as: 'placedByUser',
  onDelete: 'CASCADE',
});
db.order.belongsTo(db.user, {
  foreignKey: 'deliveryBoyUserId',
  as: 'deliveryBoyUser',
  onDelete: 'CASCADE',
});

// Foreign key for Customer
db.customer.hasMany(db.order, {
  foreignKey: {
    name: 'pickupCustomerId',
    allowNull: true,
  },
  onDelete: 'CASCADE',
});
db.order.belongsTo(db.customer, {
  foreignKey: 'pickupCustomerId',
  as: 'pickupCustomer',
  onDelete: 'CASCADE',
});

module.exports = db;
