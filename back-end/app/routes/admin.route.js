const express = require("express");
const admins = require("../controllers/admin.controller");
const authenticateToken = require("../middelware/jwt_admin");
const checkRole = require("../middelware/check_role");

const router = express.Router();
router
    .route("/")
    .get(authenticateToken.authenticateTokenFromHeader, checkRole, admins.findALL)
    .post(authenticateToken.authenticateTokenFromHeader, checkRole, admins.create)
    .delete(admins.deleteALL);

router
    .route("/login")
    .post(admins.login)

router
    .route("/forgotpassword")
    .post(admins.forgotPassword);

router
    .route("/resetpassword/:token")
    .put(authenticateToken.authenticateTokenFromParamsWithEmail, admins.resetpassword);

router
    .route("/changepassword/:token")
    .put(authenticateToken.authenticateTokenFromParams, admins.changepassword);

router
    .route("/:token")
    .get(authenticateToken.authenticateTokenFromParams, admins.findOne)

router
    .route("/:id")
    .get(admins.findOne)
    .put(authenticateToken.authenticateTokenFromHeader, checkRole, admins.update)
    .delete(authenticateToken.authenticateTokenFromHeader, checkRole, admins.delete);

module.exports = router;
