const express = require("express");
const questions = require("../controllers/question.controller");
const authenticateToken = require("../middelware/jwt_admin");

const router = express.Router();
router
    .route("/")
    .get(authenticateToken.authenticateTokenFromHeader, questions.findALL)
    .post(authenticateToken.authenticateTokenFromHeader, questions.create)
    .delete(questions.deleteALL);
router
    .route("/subject/bulk")
    .post(authenticateToken.authenticateTokenFromHeader, questions.createBulk)
router
    .route("/subject/:subjectID")
    .get(authenticateToken.authenticateTokenFromHeader, questions.findQuestionsBySubjectID)
    .put(authenticateToken.authenticateTokenFromHeader, questions.deleteSelectedQuestions)

router
    .route("/subject/:subjectID/random")
    .get(authenticateToken.authenticateTokenFromHeader, questions.findRandomQuestionsBySubjectID)


router
    .route("/:questionID")
    .get(authenticateToken.authenticateTokenFromHeader, questions.findOne)
    .put(authenticateToken.authenticateTokenFromHeader, questions.update)
    .delete(authenticateToken.authenticateTokenFromHeader, questions.delete);

module.exports = router;