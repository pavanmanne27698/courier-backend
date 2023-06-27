module.exports = (app) => {
    const Order = require("../controllers/order.controller.js");
    var router = require("express").Router();
  
    // Create a new order
    router.post("/orders/", Order.create);

    //calculating cost,time and distance for the order
    router.post("/orders/getDetails", Order.getDetailsForOrder);

    // Retrieve all order
    router.get("/orders/", Order.findAll);

    // Retrieve a single order with orderId
    router.get("/orders/:orderId", Order.findOne);
  
    // Update an order with orderId
    router.put("/orders/:orderId",  Order.update);
  
    // Delete an order with orderId
    router.delete("/orders/:orderId", Order.delete);
  
    // Delete all orders
    router.delete("/orders/", Order.deleteAll);
  
    app.use(router);
  };
  