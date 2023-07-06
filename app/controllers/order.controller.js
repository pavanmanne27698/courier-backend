const db = require("../models");
const Order = db.order;
const OrderDetails = db.orderDetails;
const Customer = db.customer;
const User = db.user;
const Op = db.Sequelize.Op;
const Route = db.route;

// Create and Save a new order
exports.create = (req, res) => {
  try {
  // Validate request
if (req.body.pickupTime === undefined || req.body.pickupTime == "") {
  const error = new Error("pickup time is empty!");
  error.statusCode = 400;
  throw error;
} else if (req.body.pickupCustomerId === undefined || req.body.pickupCustomerId == "") {
  const error = new Error("pickup customer id is empty!");
  error.statusCode = 400;
  throw error;
} else if (req.body.deliveryCustomerId === undefined ||  req.body.deliveryCustomerId == "") {
  const error = new Error("delivery customer id is empty!");
  error.statusCode = 400;
  throw error;
} else if (req.body.pickupLocation === undefined ||  req.body.pickupLocation == "") {
  const error = new Error("pickup location is empty!");
  error.statusCode = 400;
  throw error;
} else if (req.body.deliveryLocation === undefined ||  req.body.deliveryLocation == "") {
  const error = new Error("delivery location is empty!");
  error.statusCode = 400;
  throw error;
} else if (req.body.cost === undefined || req.body.cost === "") {
  const error = new Error("cost is empty!");
  error.statusCode = 400;
  throw error;
} else if (req.body.distance === undefined || req.body.distance === "" ) {
  const error = new Error("distance is empty!");
  error.statusCode = 400;
  throw error;
} else if (req.body.timeForDelivery === undefined || req.body.timeForDelivery === "" ) {
  const error = new Error("timeForDelivery is empty!");
  error.statusCode = 400;
  throw error;
} else if (req.body.placedByUserId === undefined || req.body.placedByUserId == "") {
  const error = new Error("placedByUserId is empty!");
  error.statusCode = 400;
  throw error;
}
req.body.status = "PENDING";
req.body.completedTime = req.body.completedTime || null;
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
      completedTime: req.body.completedTime,
      status: req.body.status,
      orderId: order.id,
      placedByUserId: req.body.placedByUserId,
      pickupCustomerId: req.body.pickupCustomerId,
      deliveryCustomerId: req.body.deliveryCustomerId
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
  }
  catch(e) {
    res.status(500).send({
      message: e.message ||  "Internal Server Error" ,
    });
}

};

exports.getDetailsForOrder = async(req, res) => {
  try {
    if (req.body.pickupLocation === undefined) {
      const error = new Error("pickup location cannot be empty for order!");
      error.statusCode = 400;
      throw error;
    } else if (req.body.deliveryLocation === undefined) {
      const error = new Error("delivery location cannot be empty for order!");
      error.statusCode = 400;
      throw error;
    }
    const distance = await findPath(req.body.pickupLocation,req.body.deliveryLocation)
    if(distance) {
      res.send({
        distance: distance
      });
    }
    else {
      res.status(500).send({
        message: "Error in calculating the distance",
      });
    }
  }
  catch(e) {
    res.status(500).send({
      message: e.message ||  "Error in calculating distance" ,
    });
  }
  
};

async function findPath(source, destination) {
  const data = await Route.findAll();
  const routes = {};
  data.forEach((entry) => {
    const { source, destination } = entry;
    if (!routes[source]) {
      routes[source] = {};
    }
    routes[source][destination] = 1;
  });

  const distances = {};
  const visited = {};
  Object.keys(routes).forEach((vertex) => {
    distances[vertex] = Infinity;
  });
  distances[source] = 0;

  while (true) {
    let closestVertex = null;
    let closestDistance = Infinity;

    Object.keys(routes).forEach((vertex) => {
      if (!visited[vertex] && distances[vertex] < closestDistance) {
        closestVertex = vertex;
        closestDistance = distances[vertex];
      }
    });
    if (closestVertex === null) {
      break; 
    }
    visited[closestVertex] = true;
    Object.keys(routes[closestVertex]).forEach((neighbor) => {
      const distance = closestDistance + routes[closestVertex][neighbor];
      if (distance < distances[neighbor]) {
        distances[neighbor] = distance;
      }
    });
  }
  console.log("dis",distances)
  return distances[destination];
}

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


exports.ordersByDeliveryBoy = (req,res) => {
  const id = req.params.id;
  const status = req.query.status;
  const condition = {
    '$orderDetails.deliveryBoyUserId$': id,
    '$orderDetails.status$': status
  };
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
  })    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving available delivery boys.",
      });
    });
}
exports.ordersDeliveredToCustomer = (req,res) => {
  const id = req.params.id;
  const condition = {
    '$orderDetails.deliveryCustomerId$': id
  };
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
  })     .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving available delivery boys.",
      });
    });
}
exports.ordersPlacedByCustomer = (req,res) => {
  const id = req.params.id;
  const condition = {
    '$orderDetails.pickupCustomerId$': id
  };
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
  })    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving available delivery boys.",
      });
    });
}
exports.ordersPlacedByClerk = (req,res) => {
  const id = req.params.id;
  const condition = {
    '$orderDetails.placedByUserId$': id
  };
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
  })    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving available delivery boys.",
      });
    });
}

exports.pendingOrders = (req,res) => {
  const condition = {
    '$orderDetails.status$': "PENDING"
  };
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
  })    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving available delivery boys.",
      });
    });
}

exports.progressOrders = (req,res) => {
  const condition = {
    '$orderDetails.status$': "PROGRESS"
  };
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
  })    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving available delivery boys.",
      });
    });
}

exports.deliveredOrders = (req,res) => {
  const condition = {
    '$orderDetails.status$': "DELIVERED"
  };
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
  })    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving available delivery boys.",
      });
    });
}