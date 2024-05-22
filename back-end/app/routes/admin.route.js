const express = require("express");
const admins = require("../controllers/admin.controller");
const authenticateToken = require("../middelware/jwt_admin");

const router = express.Router();
router
    .route("/")
    .get(authenticateToken.authenticateTokenFromHeader, admins.findALL)
    .post(authenticateToken.authenticateTokenFromHeader, admins.create)
    .delete(admins.deleteALL);

router
    .route("/login")
    .post(admins.login)

router
    .route("/:token")
    .get(authenticateToken.authenticateTokenFromParams, admins.findOne)

router
    .route("/:id")
    .get(admins.findOne)
    .put(authenticateToken.authenticateTokenFromHeader, admins.update)
    .delete(authenticateToken.authenticateTokenFromHeader, admins.delete);

module.exports = router;
