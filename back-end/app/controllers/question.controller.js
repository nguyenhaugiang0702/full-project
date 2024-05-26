const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");
const QuestionService = require("../services/question.service");
const { ObjectId } = require("mongodb");
const SubjectService = require("../services/subject.service");

exports.create = async (req, res, next) => {
    if (!req.body?.question_name || req.body?.options?.some(item => item.answer === '')) {
        return next(new ApiError(400, "Kiem tra lai cac cau hoi"));
    }

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
            new ApiError(500, "An Error Occurred while creating the question")
        );
    }
};

exports.createBulk = async (req, res, next) => {
    if (!req.body) {
        return next(new ApiError(400, "Vui long kiem tra lai file"));
    }

    try {
        const adminId = new ObjectId(req.admin.admin_id);
        const subjectId = req.body.subject_id;
        const questionService = new QuestionService(MongoDB.client);
        // Kiểm tra trùng tên câu hỏi trong subject hiện tại
        // Chuẩn bị dữ liệu câu hỏi từ req.body
        const questions = Object.keys(req.body)
            .filter(key => key !== 'subject_id') // Loại bỏ key subject_id 
            .map(key => {
                const question = req.body[key];
                return {
                    ...question,
                    subject_id: subjectId,
                    options: question.options
                };
            });
        // Kiểm tra tên câu hỏi trùng lặp
        const newQuestions = [];
        for (const question of questions) {
            const questionExist = await questionService.findByNameAndSubject(question.question_name.trim(), subjectId);
            if (!questionExist) {
                newQuestions.push(question);
            }
        }

        if (newQuestions.length == 0) {
            return next(new ApiError(400, "Tất cả các câu hỏi trong file đã tồn tại"));
        }

        const documents = await questionService.insertMany(newQuestions);
        return res.send(documents);
    } catch (error) {
        return next(
            new ApiError(500, "An Error Occurred while creating the question")
        );
    }
};

exports.findALL = async (req, res, next) => {
    let documents = [];

    try {
        const questionService = new QuestionService(MongoDB.client);
        const subjectService = new SubjectService(MongoDB.client);
        const admin_id = new ObjectId(req.admin.admin_id);
        const { search_value, subject_id } = req.query;
        if (search_value && subject_id) {
            documents = await questionService.findByNameAndSubjectID(search_value, subject_id);
        }
        console.log(documents);
        await Promise.all(documents.map(async (document) => {
            const subjectInfo = await subjectService.findById(document.subject_id);
            document.subjectInfo = subjectInfo;
        }))

    } catch (error) {
        return next(
            new ApiError(500, "An Error Occurred while retrieving questions")
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
            return next(new ApiError(404, "Không tìm thấy"));
        }

    } catch (error) {
        return next(
            new ApiError(500, "An Error Occurred while retrieving questions")
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
        const { search_value } = req.query;
        if (search_value) {
            documents = await questionService.findByNameAndSubjectID(search_value, subjectId);
        } else {
            documents = await questionService.find({ subject_id: subjectId });
        }
        if (!documents) {
            return next(new ApiError(404, "questions not found"));
        }
        await Promise.all(documents.map(async (document) => {
            const subjectInfo = await subjectService.findById(document.subject_id);
            document.subjectInfo = subjectInfo;
        }))
    } catch (error) {
        return next(
            new ApiError(500, "An Error Occurred while retrieving questions")
        );
    }
    return res.send(documents);
};

exports.findRandomQuestionsBySubjectID = async (req, res, next) => {
    let documents = [];

    try {
        const questionService = new QuestionService(MongoDB.client);
        const subjectService = new SubjectService(MongoDB.client);
        const subjectId = new ObjectId(req.params.subjectID);
        let { numberRandom } = req.query;
        numberRandom = parseInt(numberRandom);
        documents = await questionService.aggregate([
            { $match: { subject_id: subjectId } },
            { $sample: { size: numberRandom } }
        ]);

        // documents = await questionService.find({ subject_id: subjectId });
        documents = await questionService.shuffleArray(documents);
        if (!documents || documents.length === 0) {
            return next(new ApiError(404, "No questions found for this subject"));
        }
        await Promise.all(documents.map(async (document) => {
            const subjectInfo = await subjectService.findById(document.subject_id);
            document.subjectInfo = subjectInfo;
            // Trộn ngẫu nhiên các đáp án của câu hỏi
            if (document.options && document.options.length > 0) {
                document.options = await questionService.shuffleArray(document.options);
            }
        }))
    } catch (error) {
        return next(
            new ApiError(500, "An Error Occurred while retrieving questions")
        );
    }
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
        return res.send({ message: "Question was updated successfully" });

    } catch (error) {
        return next(
            new ApiError(500, `Error updating question with id=${req.params.questionID}`)
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const questionService = new QuestionService(MongoDB.client);
        const document = await questionService.delete(req.params.questionID);
        if (!document) {
            return next(new ApiError(404, "Question not found"));
        }
        return res.send({ message: "Question was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Could not delete Question with id=${req.params.questionID}`)
        );
    }
};

exports.deleteALL = async (req, res, next) => {
    try {
        const questionService = new QuestionService(MongoDB.client);
        const deletedCount = await questionService.deleteAll();
        return res.send({
            message: `${deletedCount} Questions were deleted successfully`,
        });
    } catch (error) {
        return next(
            new ApiError(500, 'An Error Occurred while removing all Questions')
        );
    }
};
