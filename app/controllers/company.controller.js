const db = require("../models");
const Company = db.company;
const Op = db.Sequelize.Op;

// Create and Save a new company
exports.create = (req, res) => {
  // Validate request
  if (req.body.name === undefined) {
    const error = new Error("name is empty!");
    error.statusCode = 400;
    throw error;
  } 
  else if (req.body.location === undefined) {
    const error = new Error("location is empty!");
    error.statusCode = 400;
    throw error;
  }
  else if (req.body.email === undefined) {
    const error = new Error("email is empty!");
    error.statusCode = 400;
    throw error;
  }
  // Save company in the database
  Company.create(req.body)
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

// Retrieve all companies from the database.
exports.findAll = (req, res) => {
  const companyId = req.query.companyId;
  var condition = companyId
    ? {
        id: {
          [Op.like]: `%${companyId}%`,
        },
      }
    : null;

  Company.findAll({ where: condition })
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
// Find a single company with an id
exports.findOne = (req, res) => {
  const companyId = req.params.companyId;

  Company.findByPk(companyId)
    .then((data) => {
        if (data) {
            res.json(data);
          } else {
            res.status(404).json({ error: 'company not found' });
          }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving company with id=" + id,
      });
    });
};

// Update a company by the id in the request
exports.update = (req, res) => {
  const companyId = req.params.companyId;

  Company.update(req.body, {
    where: { id: companyId },
  })
    .then((response) => {
      if (response == 1) {
        res.send({
          message: "company was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update company with id=${id}. Maybe company was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Internal Server error.",
      });
    });
};

// Delete a company with the specified id in the request
exports.delete = (req, res) => {
  const companyId = req.params.companyId;

  Company.destroy({
    where: { id: companyId },
  })
    .then((response) => {
      if (response == 1) {
        res.send({
          message: "company was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete company with id=${id}. Maybe company was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Internal Server error.",
      });
    });
};

// Delete all companies from the database.
exports.deleteAll = (req, res) => {
  Company.destroy({
    where: {},
    truncate: false,
  })
    .then((response) => {
      res.send({ message: `${response} companies were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Internal Server error.",
      });
    });
};