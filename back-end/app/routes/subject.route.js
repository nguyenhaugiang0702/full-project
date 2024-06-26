const express = require("express");
const subjects = require("../controllers/subject.controller");
const authenticateToken = require("../middelware/jwt_admin");

const router = express.Router();
router
    .route("/")
    .get(authenticateToken.authenticateTokenFromHeader, subjects.findALL)
    .post(authenticateToken.authenticateTokenFromHeader, subjects.create)
    .delete(subjects.deleteALL);

router
    .route("/:subjectID")
    .get(authenticateToken.authenticateTokenFromHeader, subjects.findOne)
    .put(authenticateToken.authenticateTokenFromHeader, subjects.update)
    .delete(authenticateToken.authenticateTokenFromHeader, subjects.delete);

router
    .route("/admin/:token")
    .put(authenticateToken.authenticateTokenFromParams, subjects.deleteSelectedSubjects);
module.exports = router;
