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
db.orderDetails = require("./orderDetails.model.js")(sequelize, Sequelize);
db.route = require("./route.model.js")(sequelize, Sequelize);

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

// Foreign key for Order
db.orderDetails.belongsTo(db.order, {
  foreignKey: 'orderId',
  as: 'order', // Use the same alias as in the include statement
  onDelete: 'CASCADE',
},
);
db.order.hasMany(db.orderDetails, {
  foreignKey: {
    name: 'orderId',
    allowNull: false,
  },
  onDelete: 'CASCADE',
  as: 'orderDetails', // Use the same alias as in the include statement
});

// Foreign key for User
db.user.hasMany(db.orderDetails, {
  foreignKey: {
    name: 'placedByUserId',
    allowNull: false,
  },
  onDelete: 'CASCADE',
});
db.user.hasMany(db.orderDetails, {
  foreignKey: {
    name: 'deliveryBoyUserId',
    allowNull: true,
  },
  onDelete: 'CASCADE',
});
db.orderDetails.belongsTo(db.user, {
  foreignKey: 'placedByUserId',
  as: 'placedByUser',
  onDelete: 'CASCADE',
});
db.orderDetails.belongsTo(db.user, {
  foreignKey: 'deliveryBoyUserId',
  as: 'deliveryBoyUser',
  onDelete: 'CASCADE',
});

// Foreign key for Customer
db.customer.hasMany(db.orderDetails, {
  foreignKey: {
    name: 'pickupCustomerId',
    allowNull: true,
  },
  onDelete: 'CASCADE',
});
db.customer.hasMany(db.orderDetails, {
  foreignKey: {
    name: 'deliveryCustomerId',
    allowNull: true,
  },
  onDelete: 'CASCADE',
});
db.orderDetails.belongsTo(db.customer, {
  foreignKey: 'pickupCustomerId',
  as: 'pickupCustomer',
  onDelete: 'CASCADE',
});
db.orderDetails.belongsTo(db.customer, {
  foreignKey: 'deliveryCustomerId',
  as: 'deliveryCustomer',
  onDelete: 'CASCADE',
});

module.exports = db;
