const db = require("../models");
const Order = db.order;
const OrderDetails = db.orderDetails;
const Customer = db.customer;
const User = db.user;
const Op = db.Sequelize.Op;

// Create and Save a new order
exports.create = (req, res) => {
  // Validate request
if (req.body.pickupTime === undefined) {
  const error = new Error("pickup time is empty!");
  error.statusCode = 400;
  throw error;
} else if (req.body.pickupCustomerId === undefined) {
  const error = new Error("pickup customer id is empty!");
  error.statusCode = 400;
  throw error;
} else if (req.body.deliveryCustomerId === undefined) {
  const error = new Error("delivery customer id is empty!");
  error.statusCode = 400;
  throw error;
} else if (req.body.pickupLocation === undefined) {
  const error = new Error("pickup location is empty!");
  error.statusCode = 400;
  throw error;
} else if (req.body.deliveryLocation === undefined) {
  const error = new Error("delivery location is empty!");
  error.statusCode = 400;
  throw error;
} else if (req.body.cost === undefined) {
  const error = new Error("cost is empty!");
  error.statusCode = 400;
  throw error;
} else if (req.body.distance === undefined) {
  const error = new Error("distance is empty!");
  error.statusCode = 400;
  throw error;
} else if (req.body.timeForDelivery === undefined) {
  const error = new Error("timeForDelivery is empty!");
  error.statusCode = 400;
  throw error;
} else if (req.body.placedByUserId === undefined) {
  const error = new Error("placedByUserId is empty!");
  error.statusCode = 400;
  throw error;
}

req.body.status = "PENDING";

// Save order in the database
Order.create({
  timeForDelivery: req.body.timeForDelivery,
  distance: req.body.distance,
  cost: req.body.cost,
})
  .then((order) => {
    const orderDetail = {
      pickupLocation: req.body.pickupLocation,
      deliveryLocation: req.body.deliveryLocation,
      pickupTime: req.body.pickupTime,
      completedTime: null,
      status: req.body.status,
      orderId: order.id,
      placedByUserId: req.body.placedByUserId
    };
    OrderDetails.create(orderDetail)
      .then((orderDetail) => {
        res.send({
          order,
          orderDetail
        });
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Internal Server error.",
        });
      });
  })
  .catch((err) => {
    res.status(500).send({
      message: err.message || "Internal Server error.",
    });
  });

};

exports.getDetailsForOrder = (req, res) => {
  // Validate request
  if (req.body.pickupTime === undefined) {
    const error = new Error("pickupTime is empty!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.pickupCustomerId === undefined) {
    const error = new Error("pickupCustomerId is empty!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.deliveryCustomerId === undefined) {
    const error = new Error("deliveryCustomerId is empty!");
    error.statusCode = 400;
    throw error;
  }
  // apply dikjestra algorithm

  res.send({
    cost: 40,
    timeForDelivery: 15,
    distance: 2
  });
  
};

// Retrieve all categories from the database.
exports.findAll = (req, res) => {
  const orderId = req.query.orderId;
  var condition = orderId
    ? {
        id: {
          [Op.like]: `%${orderId}%`,
        },
      }
    : null;

    Order.findAll({
      where: condition,
      include: [
        {
          model: OrderDetails,
          as: 'orderDetails',
          include: [
            { model: Customer, as: 'pickupCustomer' },
            { model: Customer, as: 'deliveryCustomer' },
            { model: User, as: 'placedByUser' },
            { model: User, as: 'deliveryBoyUser' },
          ],
        },
      ],
    })
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || 'Internal Server error.',
        });
      });
};

// Find a single order with an id
exports.findOne = (req, res) => {
  const orderId = req.params.orderId;

  Order.findByPk(orderId, {
    include: [
      {
        model: OrderDetails,
        as: 'orderDetails',
        include: [
          { model: Customer, as: 'pickupCustomer' },
          { model: Customer, as: 'deliveryCustomer' },
          { model: User, as: 'placedByUser' },
          { model: User, as: 'deliveryBoyUser' },
        ],
      },
    ],
  })
    .then((data) => {
      if (data) {
        res.json(data);
      } else {
        res.status(404).json({ error: 'Order not found' });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Internal Server error.',
      });
    });
};

// Update a order by the id in the request
exports.update = (req, res) => {
  const orderId = req.params.orderId;

  Order.update(req.body, {
    where: { id: orderId },
  })
    .then((response) => {
      if (response == 1) {
        res.send({
          message: "order was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update order with id=${id}. Maybe order was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Internal Server error.",
      });
    });
};

// Delete a order with the specified id in the request
exports.delete = (req, res) => {
  const orderId = req.params.orderId;

  Order.destroy({
    where: { id: orderId },
  })
    .then((response) => {
      if (response == 1) {
        res.send({
          message: "order was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete order with id=${id}. Maybe order was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Internal Server error.",
      });
    });
};

// Delete all categories from the database.
exports.deleteAll = (req, res) => {
  Order.destroy({
    where: {},
    truncate: false,
  })
    .then((response) => {
      res.send({ message: `${response} categories were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Internal Server error.",
      });
    });
};