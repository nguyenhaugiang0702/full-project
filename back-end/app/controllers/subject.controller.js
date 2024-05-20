const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");
const SubjectService = require("../services/subject.service");
const QuestionService = require("../services/question.service");
const { ObjectId } = require("mongodb");

exports.create = async (req, res, next) => {
    if (!req.body?.subject_name || !req.body?.subject_code) {
        return next(new ApiError(400, "Kiem tra lai ten va ma mon hoc"));
    }

    try {
        const admin_id = new ObjectId(req.admin.admin_id);
        // Loại bỏ khoảng trắng đầu và cuối chuỗi
        const subject_name = req.body.subject_name.trim();
        const subject_code = req.body.subject_code.trim();
        const payload = {
            subject_name,
            subject_code,
            admin_id,
        };

        const subjectService = new SubjectService(MongoDB.client);
        // Kiểm tra trùng tên môn học cho giáo viên hiện tại
        const nameExist = await subjectService.findByNameAndAdmin(subject_name, admin_id);
        if (nameExist) {
            return next(new ApiError(400, "Tên môn học đã tồn tại"));
        }

        // Kiểm tra trùng mã môn học cho giáo viên hiện tại
        const codeExist = await subjectService.findByCodeAndAdmin(subject_code, admin_id);
        if (codeExist) {
            return next(new ApiError(400, "Mã môn học đã tồn tại"));
        }
        const document = await subjectService.create(payload);
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
        const subjectService = new SubjectService(MongoDB.client);
        const questionService = new QuestionService(MongoDB.client);
        const admin_id = new ObjectId(req.admin.admin_id);
        const { name } = req.query;
        if (name) {
            documents = await subjectService.findByName(name);
        } else {
            documents = await subjectService.find({ admin_id: admin_id });
        }
        // Đếm số câu hỏi cho mỗi môn học
        await Promise.all(documents.map(async (subject) => {
            const questionCount = await questionService.countBySubjectId(subject._id);
            subject.questionCount = questionCount;
        }));
    } catch (error) {
        return next(
            new ApiError(500, "An Error Occurred while retrieving contacts")
        );
    }

    return res.send(documents);
};


exports.findOne = async (req, res, next) => {
    try {
        const subjectService = new SubjectService(MongoDB.client);
        const document = await subjectService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Contact not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "An Error Occurred while retrieving contacts")
        );
    }
};

exports.update = async (req, res, next) => {
    if (!req.body?.subject_name || !req.body?.subject_code) {
        return next(new ApiError(400, "Kiểm tra lại tên và mã môn học"));
    }

    try {
        const subjectService = new SubjectService(MongoDB.client);
        const subjectId = req.params.subjectID;
        const admin_id = req.admin.admin_id;
        const existingSubject = await subjectService.findById(subjectId);
        if (!existingSubject) {
            return next(new ApiError(404, "Môn học không tồn tại"));
        }

        // Kiểm tra trùng tên môn học và mã môn
        const nameExist = await subjectService.findByNameAndAdmin(req.body.subject_name.trim(), admin_id);
        const codeExist = await subjectService.findByCodeAndAdmin(req.body.subject_code.trim(), admin_id);

        req.body = {
            subject_name: req.body.subject_name.trim(),
            subject_code: req.body.subject_code.trim(),
            admin_id: new ObjectId(admin_id)
        };

        if (nameExist && !codeExist) {
            const document = await subjectService.update(subjectId, req.body);
            if (!document) {
                return next(new ApiError(404, "Subject not found"));
            }
        } else if (!nameExist && codeExist) {
            const document = await subjectService.update(subjectId, req.body);
            if (!document) {
                return next(new ApiError(404, "Subject not found"));
            }
        } else {
            return next(new ApiError(400, "Tên môn học, Mã môn học đã tồn tại"));
        }

        return res.send({ messgae: "Subject was updated successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Error updating contact with id=${req.params.subjectID}`)
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const subjectService = new SubjectService(MongoDB.client);
        const questionService = new QuestionService(MongoDB.client);

        const document = await subjectService.delete(req.params.subjectID);
        if (!document) {
            return next(new ApiError(404, "Subject not found"));
        }
        await questionService.deleteBySubjectId(req.params.subjectID);
        return res.send({ messgae: "Subject was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Could not delete Subject with id=${req.params.subjectID}`)
        );
    }
};

exports.deleteALL = async (req, res, next) => {
    try {
        const subjectService = new SubjectService(MongoDB.client);
        const deletedCount = await subjectService.deleteAll();
        return res.send({
            message: `${deletedCount} contacts were deleted successfully`,
        });
    } catch (error) {
        return next(
            new ApiError(500, 'An Error Occurred while removing all contacts')
        );
    }
};
