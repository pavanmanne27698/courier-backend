module.exports = (app) => {
  const User = require("../controllers/user.controller.js");
  const { authenticateRoute } = require("../authentication/authentication");
  var router = require("express").Router();
  router.post("/users/", User.create);
  router.get("/users/", User.findAll);
  router.get('/users/available', User.findAllAvailableUsers);
  router.get("/users/:id", User.findOne);
  router.put("/users/:id", User.update);
  router.delete("/users/:id", User.delete);
  router.delete("/users/", User.deleteAll);
  app.use(router);
};
