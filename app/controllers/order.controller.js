const db = require("../models");
const Order = db.order;
const Customer = db.customer;
const User = db.user;
const Op = db.Sequelize.Op;
const Route = db.route;
const nodemailer = require('nodemailer');
const Sequelize = db.Sequelize;

// Create and Save a new order
exports.create = (req, res) => {
  try {
  // Validate request
if (req.body.pickupDateTime === undefined || req.body.pickupDateTime == "") {
  const error = new Error("pickup time is empty!");
  error.statusCode = 400;
  throw error;
} else if (req.body.pickupCustomerId === undefined || req.body.pickupCustomerId == "") {
  const error = new Error("pickup customer id is empty!");
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
} else if (req.body.companyId === undefined || req.body.companyId == "") {
  const error = new Error("companyId is empty!");
  error.statusCode = 400;
  throw error;
}
req.body.status = "pending";
// Save order in the database
Order.create({
  timeForDelivery: req.body.timeForDelivery,
  distance: req.body.distance,
  cost: req.body.cost,
  pickupLocation: req.body.pickupLocation,
  deliveryLocation: req.body.deliveryLocation,
  pickupDateTime: req.body.pickupDateTime,
  status: req.body.status,
  placedByUserId: req.body.placedByUserId,
  pickupCustomerId: req.body.pickupCustomerId,
  companyId: req.body.companyId
})
  .then((order) => {
      res.send(order);
      sendMail(order,"Thank you for placing your order.")
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
  const companyId = req.query.companyId
  var condition = orderId
    ? {
        id: {
          [Op.like]: `%${orderId}%`,
        },
      }
    : null;
  if (companyId !== undefined) {
      condition.companyId = companyId;
    }
    Order.findAll({
        where: condition,
        include: [  { model: Customer, as: 'pickupCustomer' },{ model: User, as: 'deliveryBoyUser' },{ model: User, as: 'placedByUser' }]
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
    include: [  { model: Customer, as: 'pickupCustomer' },{ model: User, as: 'deliveryBoyUser' },{ model: User, as: 'placedByUser' }]
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


exports.ordersByDeliveryBoy = async(req,res) => {
  const id = req.params.id;
  const companyId = req.query.companyId;
  const condition = {
    deliveryBoyUserId: id,
  };
  if (companyId !== undefined) {
    condition.companyId = companyId;
  }
  await getOrders(condition,res)
}

exports.ordersPlacedByCustomer = async(req,res) => {
  const id = req.params.id;
  const companyId = req.query.companyId;
  const condition = {
    pickupCustomerId: id,
  };
  if (companyId !== undefined) {
    condition.companyId = companyId;
  }
  await getOrders(condition,res)
}
exports.ordersPlacedByClerk = async(req,res) => {
  const id = req.params.id;
  const companyId = req.query.companyId;
  const condition = {
    placedByUserId: id,
  };
  if (companyId !== undefined) {
    condition.companyId = companyId;
  }
  await getOrders(condition,res)
}

exports.pendingOrders = async(req,res) => {
  const companyId = req.query.companyId;
  const condition = {
    status: "pending"
  };
  if (companyId !== undefined) {
    condition.companyId = companyId;
  }
  await getOrders(condition,res)
}

exports.progressOrders = async(req,res) => {
  const companyId = req.query.companyId;
  const condition = {
    status: "progress",
  };
  if (companyId !== undefined) {
    condition.companyId = companyId;
  }
  await getOrders(condition,res)
}

exports.deliveredOrders = async(res) => {
  const companyId = req.query.companyId;
  const condition = {
    status: "delivered",
  };
  if (companyId !== undefined) {
    condition.companyId = companyId;
  }
  await getOrders(condition,res)
}

const getOrders = (condition,res) => {
  Order.findAll({
    where: condition,
    include: [  { model: Customer, as: 'pickupCustomer' },{ model: User, as: 'deliveryBoyUser' },{ model: User, as: 'placedByUser' }]
  })    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving available delivery boys.",
      });
    });
}

exports.pickedup  = async(req, res) => {
  try{
  const id = req.params.id;
  const order = await Order.findByPk(id)
  const updatedData = {
    pickedupDateTime: Sequelize.literal('CURRENT_TIMESTAMP'),
    status:"progress"
  }
  Order.update(updatedData, {
    where: { id: id },
  })
    .then((response) => {
      if (response == 1) {
        res.send({
          message: "order was updated successfully.",
        });
        sendMail(order,"Your Order is pickedup just now.")
      } else {
        res.send({
          message: `Cannot update order with id=${id}. Maybe order was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating order with id=" + id,
      });
    });
  }
  catch(e) {
    res.status(500).send({
      message: e.message || "Error updating order with id=" + id,
    });
  }
};

function checkDeliveredInTime(pickedupTime, timeTakesForDelivery) {
  const currentTime = new Date();
  const pickTime = new Date(pickedupTime);
  const timeDifference = currentTime - pickTime;
  const minutesDifference = Math.floor(timeDifference / 1000 / 60); // Convert milliseconds to minutes

  return minutesDifference <= timeTakesForDelivery;
}

exports.delivered  = async(req, res) => {
  try {
  const id = req.params.id;
  const order  = await Order.findByPk(id)
  const current_time = new Date();
  const deliveredInTime = checkDeliveredInTime(order.pickedupDateTime,current_time,order.timeForDelivery)
  const updatedData = {
    deliveredDateTime: Sequelize.literal('CURRENT_TIMESTAMP'),
    status:"delivered",
    isDeliveredInTime: deliveredInTime ? 1 : 0,
    deliveryBoyPoints : deliveredInTime ? 10 : 0
  }
  Order.update(updatedData, {
    where: { id: id },
  })
    .then((response) => {
      if (response == 1) {
        res.send({
          message: "order was updated successfully.",
        });
        sendMail(order,"Your Order is delivered just now.")
      } else {
        res.send({
          message: `Cannot update order with id=${id}. Maybe order was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating order with id=" + id,
      });
    });
  }
  catch(e) {
    res.status(500).send({
      message: e.message || "Error updating order with id=" + id,
    });
  }
};

const sendMail = async(data,text) => {
  const customer = await Customer.findByPk(data.pickupCustomerId);

  // Create a transporter object
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'email',
      pass: 'password'
    }
  });

  // Define the email options
  const mailOptions = {
    from: 'email',
    to: customer.email,
    subject: "ACME COURIERS",
    text
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent successfully:', info.response);
    }
  });
}