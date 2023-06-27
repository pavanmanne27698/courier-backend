const db = require("../models");
const Customer = db.customer;
const Op = db.Sequelize.Op;

// Create and Save a new customer
exports.create = (req, res) => {
  // Validate request
  if (req.body.firstName === undefined) {
    const error = new Error("firstName is empty!");
    error.statusCode = 400;
    throw error;
  } 
  else if (req.body.lastName === undefined) {
    const error = new Error("lastName is empty!");
    error.statusCode = 400;
    throw error;
  }
  else if (req.body.email === undefined) {
    const error = new Error("email is empty!");
    error.statusCode = 400;
    throw error;
  }
  else if (req.body.mobile === undefined) {
    const error = new Error("mobile is empty!");
    error.statusCode = 400;
    throw error;
  }
  else if (req.body.address === undefined) {
    const error = new Error("address is empty!");
    error.statusCode = 400;
    throw error;
  }
  else if (req.body.apartmentNumber === undefined) {
    const error = new Error("apartmentNumber is empty!");
    error.statusCode = 400;
    throw error;
  }
  // Save customer in the database
  Customer.create(req.body)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Internal Server error.",
      });
    });
};

// Retrieve all customers from the database.
exports.findAll = (req, res) => {
  const customerId = req.query.customerId;
  var condition = customerId
    ? {
        id: {
          [Op.like]: `%${customerId}%`,
        },
      }
    : null;

  Customer.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Internal Server error.",
      });
    });
};
// Find a single customer with an id
exports.findOne = (req, res) => {
  const customerId = req.params.customerId;

  Customer.findByPk(customerId)
    .then((data) => {
        if (data) {
            res.json(data);
          } else {
            res.status(404).json({ error: 'customer not found' });
          }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving customer with id=" + id,
      });
    });
};

// Update a customer by the id in the request
exports.update = (req, res) => {
  const customerId = req.params.customerId;

  Customer.update(req.body, {
    where: { id: customerId },
  })
    .then((response) => {
      if (response == 1) {
        res.send({
          message: "customer was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update customer with id=${id}. Maybe customer was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Internal Server error.",
      });
    });
};

// Delete a customer with the specified id in the request
exports.delete = (req, res) => {
  const customerId = req.params.customerId;

  Customer.destroy({
    where: { id: customerId },
  })
    .then((response) => {
      if (response == 1) {
        res.send({
          message: "customer was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete customer with id=${id}. Maybe customer was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Internal Server error.",
      });
    });
};

// Delete all customers from the database.
exports.deleteAll = (req, res) => {
  Customer.destroy({
    where: {},
    truncate: false,
  })
    .then((response) => {
      res.send({ message: `${response} customers were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Internal Server error.",
      });
    });
};