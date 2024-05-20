const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");
const QuestionService = require("../services/question.service");
const { ObjectId } = require("mongodb");
const { options } = require("../routes/question.route");
const SubjectService = require("../services/subject.service");

exports.create = async (req, res, next) => {
    if (!req.body?.question_name || !req.body?.options) {
        return next(new ApiError(400, "Kiem tra lai cac cau hoi"));
    }
    console.log(req.body);
    try {
        const admin_id = new ObjectId(req.admin.admin_id);
        const question_name = req.body.question_name.trim();
        const questionService = new QuestionService(MongoDB.client);
        // Kiểm tra trùng tên câu hỏi trong subject hiện tại
        const questionExist = await questionService.findByNameAndSubject(question_name, req.body.subject_id);
        if (questionExist) {
            return next(new ApiError(400, "Tên câu hỏi đã tồn tại trong môn học này"));
        }
        const document = await questionService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "An Error Occurred while creating the contact")
        );
    }
};

exports.findALL = async (req, res, next) => {
    let documents = [];

    try {
        const questionService = new QuestionService(MongoDB.client);
        const subjectService = new SubjectService(MongoDB.client);
        const admin_id = new ObjectId(req.admin.admin_id);
        const { name } = req.query;
        const { subject_id } = req.query;
        if (subject_id) {
            documents = await questionService.findBySubjectID(subject_id);
        }
        // else {
        //     documents = await questionService.find({});
        // }
        
    } catch (error) {
        return next(
            new ApiError(500, "An Error Occurred while retrieving contacts")
        );
    }

    return res.send(documents);
};


exports.findOne = async (req, res, next) => {
    let documents = [];

    try {
        const questionService = new QuestionService(MongoDB.client);
        const subjectId = new ObjectId(req.params.subjectID);
        documents = await questionService.find({ subject_id: subjectId });
        if (!documents) {
            return next(new ApiError(404, "Contact not found"));
        }
        
    } catch (error) {
        return next(
            new ApiError(500, "An Error Occurred while retrieving contacts")
        );
    }
    return res.send(documents);
};

exports.findQuestionsBySubjectID = async (req, res, next) => {
    let documents = [];

    try {
        const questionService = new QuestionService(MongoDB.client);
        const subjectService = new SubjectService(MongoDB.client);
        const subjectId = new ObjectId(req.params.subjectID);
        documents = await questionService.find({ subject_id: subjectId });
        if (!documents) {
            return next(new ApiError(404, "Contact not found"));
        }
        await Promise.all(documents.map( async (document) => {
            const subjectInfo = await subjectService.findById(document.subject_id);
            document.subjectInfo = subjectInfo;
        }))
    } catch (error) {
        return next(
            new ApiError(500, "An Error Occurred while retrieving contacts")
        );
    }
    console.log(documents);
    return res.send(documents);
};

exports.update = async (req, res, next) => {
    if (!req.body?.question_name) {
        return next(new ApiError(400, "Kiểm tra lại tên câu hỏi"));
    }

    // Kiểm tra nếu có bất kỳ câu trả lời nào trống
    const emptyAnswer = req.body.options.some(option => option.answer.trim() === "");
    // Kiểm tra nếu tất cả các giá trị is_correct đều là false
    const allIncorrect = req.body.options.every(option => option.is_correct === false);

    if (emptyAnswer && allIncorrect) {
        return next(new ApiError(400, "Kiểm tra lại cac dap an"));
    }

    try {
        const questionService = new QuestionService(MongoDB.client);
        const questionID = req.params.questionID;
        const subjectID = req.body.subject_id;
        const admin_id = req.admin.admin_id;
        const existingQuestion = await questionService.findById(questionID);
        if (!existingQuestion) {
            return next(new ApiError(404, "Câu hỏi không tồn tại"));
        }

        req.body = {
            question_name: req.body.question_name.trim(),
            options: req.body.options.map(option => ({
                ...option,
                answer: option.answer.trim(),
            })),
            subject_id: subjectID,
        };

        const document = await questionService.update(questionID, req.body);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy câu hỏi"));
        }
        return res.send({ messgae: "Subject was updated successfully" });

    } catch (error) {
        return next(
            new ApiError(500, `Error updating contact with id=${req.params.questionID}`)
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const questionService = new QuestionService(MongoDB.client);
        const document = await questionService.delete(req.params.questionID);
        if (!document) {
            return next(new ApiError(404, "Subject not found"));
        }
        return res.send({ messgae: "Subject was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Could not delete Subject with id=${req.params.questionID}`)
        );
    }
};

exports.deleteALL = async (req, res, next) => {
    try {
        const questionService = new QuestionService(MongoDB.client);
        const deletedCount = await questionService.deleteAll();
        return res.send({
            message: `${deletedCount} contacts were deleted successfully`,
        });
    } catch (error) {
        return next(
            new ApiError(500, 'An Error Occurred while removing all contacts')
        );
    }
};
