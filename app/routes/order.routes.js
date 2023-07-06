module.exports = (app) => {
  const Order = require("../controllers/order.controller.js");
  var router = require("express").Router();
  router.post("/orders/", Order.create);
  router.get("/ordersByDeliveryBoy/:id", Order.ordersByDeliveryBoy);
  router.get("/ordersPlacedByClerk/:id", Order.ordersPlacedByClerk);
  router.get("/deliveredOrders", Order.deliveredOrders);
  router.get("/pendingOrders", Order.pendingOrders);
  router.get("/progressOrders", Order.progressOrders);
  router.get("/ordersDeliveredToCustomer/:id", Order.ordersDeliveredToCustomer);
  router.get("/ordersPlacedByCustomer/:id", Order.ordersPlacedByCustomer);
  router.post("/orders/getDetails", Order.getDetailsForOrder);
  router.get("/orders/", Order.findAll);
  router.get("/orders/:orderId", Order.findOne);
  router.put("/orders/:orderId",  Order.update);
  router.delete("/orders/:orderId", Order.delete);
  router.delete("/orders/", Order.deleteAll);
  app.use(router);
};
