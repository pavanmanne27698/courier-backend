module.exports = (app) => {
  const Company = require("../controllers/company.controller.js");
  var router = require("express").Router();

  // Create a new company
  router.post("/companies/", Company.create);

  // Retrieve all company
  router.get("/companies/", Company.findAll);

  // Retrieve a single company with companyId
  router.get("/companies/:companyId", Company.findOne);

  // Update an company with companyId
  router.put("/companies/:companyId",  Company.update);

  // Delete an company with companyId
  router.delete("/companies/:companyId", Company.delete);

  // Delete all companies
  router.delete("/companies/", Company.deleteAll);

  app.use(router);
};
