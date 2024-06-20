const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");
const AdminService = require("../services/admin.service");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const SubjectService = require("../services/subject.service");
const QuestionService = require("../services/question.service");
const { ObjectId } = require("mongodb");
const validator = require("validator");
const sendEmail = require("../utils/email.utils");
const config = require("../config/index");

exports.create = async (req, res, next) => {
    if (
        !req.body?.admin_name ||
        !req.body?.admin_id ||
        !req.body?.admin_email ||
        !req.body?.admin_password
    ) {
        return next(new ApiError(400, "Kiem tra lai cac truong"));
    }

    // Check if admin_id is a natural number
    const adminID = Number(req.body.admin_id);
    if (!Number.isInteger(adminID) || adminID <= 0) {
        return next(new ApiError(400, "ID phải là số > 0"));
    }

    if (
        req.body.admin_password.length < 8 ||
        req.body.admin_password.length > 50
    ) {
        return next(new ApiError(400, "Mật khẩu phải từ 8 đến 50 ký tự"));
    }

    if (
        req.body.admin_name.trim().length < 5 ||
        req.body.admin_name.trim().length > 50
    ) {
        return next(new ApiError(400, "Tên phải từ 5 đến 50 ký tự"));
    }

    if (!validator.isEmail(req.body.admin_email)) {
        return next(new ApiError(400, "Email không hợp lệ"));
    }

    if (req.body.admin_email.trim().length > 50) {
        return next(new ApiError(400, "Email phải nhỏ hơn 50 ký tự"));
    }

    try {
        // const admin_id = new ObjectId(req.admin.admin_id);
        const admin_name = req.body.admin_name.trim();
        const admin_id = parseInt(req.body.admin_id.trim());
        const admin_email = req.body.admin_email.trim();
        const admin_password = await bcrypt.hash(req.body.admin_password, 10);

        const payload = {
            admin_name,
            admin_email,
            admin_id,
            admin_password,
        };

        const adminService = new AdminService(MongoDB.client);
        // Kiem tra cac truong truoc khi them
        const { nameExist, emailExist, IDExist, latestID } =
            await adminService.checkValidate(
                admin_name,
                admin_email,
                admin_id,
                null,
                "teacher",
                "add"
            );

        if (IDExist) {
            const newID = latestID ? latestID + 1 : 1;
            return next(
                new ApiError(400, `Đã tồn tại ID này, có thể thử ID mới: ${newID}`)
            );
        }

        if (nameExist) {
            return next(new ApiError(400, "Đã tồn tại tên này"));
        }

        if (emailExist) {
            return next(new ApiError(400, "Đã tồn tại Email này"));
        }

        const document = await adminService.create(payload);
        const message = `<p>Chào mừng ${admin_name},</p><p>Thông tin đăng nhập của bạn là:</p><p>ID: ${admin_id}</p><p>Email: ${admin_email}</p><p>Password: ${req.body.admin_password}</p><h3>Vui lòng không chia sẻ cho bất kỳ ai</h3>`;
        await sendEmail({
            email: payload.admin_email,
            subject: "Chào mừng bạn đến với hệ thống",
            html: message,
        });
        return res.send(document);
    } catch (error) {
        if (error.message) {
            return next(new ApiError(400, error.message));
        }
        return next(
            new ApiError(500, "An Error Occurred while creating the contact")
        );
    }
};

exports.login = async (req, res, next) => {
    if (
        !req.body?.admin_id ||
        !req.body?.admin_password ||
        !req.body?.admin_email
    ) {
        return next(new ApiError(400, "Kiểm tra lại mã số, mật khẩu và email"));
    }

    try {
        const adminService = new AdminService(MongoDB.client);
        const admin = await adminService.authenticate(req.body);
        if (!admin) {
            return next(new ApiError(404, "Lỗi đăng nhập, kiểm tra lại thông tin"));
        }

        const accessToken = jwt.sign(
            { admin_id: admin._id },
            "my_secret_key_admin",
            { expiresIn: 24 * 60 * 60 }
        );
        return res.json({
            message: "Thanh cong",
            accessToken: accessToken,
            admin,
        });
    } catch (error) {
        const errorMessage = error.message || "Có lỗi xảy ra";
        return next(new ApiError(500, errorMessage));
    }
};

exports.forgotPassword = async (req, res, next) => {
    if (!req.body?.admin_email) {
        return next(new ApiError(400, "Kiểm tra lại email"));
    }

    try {
        const adminService = new AdminService(MongoDB.client);
        const userEmailExist = await adminService.findByEmail(req.body.admin_email);
        if (!userEmailExist) {
            return next(new ApiError(404, "Không tìm thấy địa chỉ Email"));
        }
        const accessTokenWithEmail = jwt.sign(
            { admin_email: userEmailExist.admin_email, _id: userEmailExist._id },
            "my_secret_key_admin_email",
            { expiresIn: "15m" }
        );
        const resetUrl = `${config.viteApp.url}/resetpassword/${accessTokenWithEmail}`;
        const message = `
        <p>Chúng tôi đã nhận được yêu cầu đổi mật khẩu. Vui lòng click vào link bên dưới để thay đổi mật khẩu:</p>
        <a href="${resetUrl}">Click Here</a>
        <p>Thời hạn là 15 phút, sau thời gian này bạn không thể đổi mật khẩu.</p>
    `;
        try {
            await sendEmail({
                email: userEmailExist.admin_email,
                subject: "Yeu cau thay doi mat khau",
                html: message,
            });
        } catch (error) {
            console.log("loi khi gui mail" + error);
        }

        return res.status(200).json({
            status: "success",
            message: "password reset link send to the user email",
        });
    } catch (error) {
        const errorMessage = error.message || "Có lỗi xảy ra";
        return next(new ApiError(500, errorMessage));
    }
};

exports.resetpassword = async (req, res, next) => {
    if (!req.admin?.admin_email || !req.admin?._id) {
        return next(new ApiError(405, "Kiểm tra lại Email"));
    }

    try {
        const adminService = new AdminService(MongoDB.client);
        const userEmailExist = await adminService.findByEmail(
            req.admin.admin_email
        );
        const user_IDExist = await adminService.findById(req.admin._id);
        if (!userEmailExist) {
            return next(new ApiError(404, "Không tìm thấy địa chỉ Email"));
        }
        if (!user_IDExist) {
            return next(new ApiError(404, "Không tìm thấy ID người dùng"));
        }
        req.body = {
            admin_password: await bcrypt.hash(req.body.admin_password, 10),
            admin_role: user_IDExist.admin_role,
        };
        const document = await adminService.update(req.admin._id, req.body);

        return res.send(document);
    } catch (error) {
        const errorMessage = error.message || "Có lỗi xảy ra";
        return next(new ApiError(500, errorMessage));
    }
};

exports.changepassword = async (req, res, next) => {
    if (!req.admin?.admin_id) {
        return next(new ApiError(405, "Kiểm tra lại Email"));
    }

    try {
        const adminService = new AdminService(MongoDB.client);
        const user_IDExist = await adminService.findById(req.admin.admin_id);
        if (!user_IDExist) {
            return next(new ApiError(404, "Không tìm thấy ID người dùng"));
        }
        req.body = {
            admin_password: await bcrypt.hash(req.body.admin_password, 10),
            admin_role: user_IDExist.admin_role,
        };
        const document = await adminService.update(req.admin.admin_id, req.body);

        return res.send(document);
    } catch (error) {
        const errorMessage = error.message || "Có lỗi xảy ra";
        return next(new ApiError(500, errorMessage));
    }
};

exports.findALL = async (req, res, next) => {
    let documents = [];

    try {
        const adminService = new AdminService(MongoDB.client);
        const { search_value } = req.query;
        if (search_value) {
            documents = await adminService.findByAdminNameAndEmail(
                search_value,
                search_value,
                "teacher"
            );
        } else {
            documents = await adminService.find({ admin_role: "teacher" });
        }
    } catch (error) {
        return next(new ApiError(500, "An Error Occurred while retrieving admins"));
    }

    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const adminId = req.admin.admin_id;
        const adminService = new AdminService(MongoDB.client);
        const document = await adminService.findById(adminId);
        if (!document) {
            return next(new ApiError(404, "Admin not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, "An Error Occurred while retrieving admins"));
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length == 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }

    // Check if admin_id is a natural number
    const adminID = Number(req.body.admin_id);
    if (!Number.isInteger(adminID) || adminID <= 0) {
        return next(new ApiError(400, "ID phải là số > 0"));
    }

    if (
        req.body.admin_name.trim().length < 5 ||
        req.body.admin_name.trim().length > 50
    ) {
        return next(new ApiError(400, "Tên phải từ 5 đến 50 ký tự"));
    }

    if (!validator.isEmail(req.body.admin_email)) {
        return next(new ApiError(400, "Email không hợp lệ"));
    }

    if (req.body.admin_email.trim().length > 50) {
        return next(new ApiError(400, "Email phải nhỏ hơn 50 ký tự"));
    }

    try {
        const adminService = new AdminService(MongoDB.client);
        // Kiểm tra trùng tên môn học và mã môn
        const { nameExist, emailExist, IDExist, latestID } =
            await adminService.checkValidate(
                req.body.admin_name.trim(),
                req.body.admin_email.trim(),
                adminID,
                req.body._id,
                "teacher",
                "update"
            );

        if (IDExist) {
            const newID = latestID ? latestID + 1 : 1;
            return next(
                new ApiError(400, `Đã tồn tại ID này, có thể thử ID mới: ${newID}`)
            );
        }
        if (nameExist) {
            return next(new ApiError(400, "Đã tồn tại tên này"));
        }
        if (emailExist) {
            return next(new ApiError(400, "Đã tồn tại Email này"));
        }

        req.body = {
            admin_name: req.body.admin_name.trim(),
            admin_email: req.body.admin_email.trim(),
            admin_id: adminID,
        };

        const document = await adminService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy giảng viên"));
        }

        const message = `<p>Xin chào ${req.body.admin_name},</p><p>Thông tin đăng nhập của bạn đã được thay đổi là:</p><p>ID: ${adminID}</p><p>Email: ${req.body.admin_email}</p><h3>Vui lòng không chia sẻ cho bất kỳ ai</h3>`;
        await sendEmail({
            email: req.body.admin_email,
            subject: "Thông tin của bạn đã được thay đổi ",
            html: message,
        });

        return res.send({ message: "admin was updated successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Error updating admin with id=${req.params.id}`)
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const adminService = new AdminService(MongoDB.client);
        const subjectService = new SubjectService(MongoDB.client);
        const questionService = new QuestionService(MongoDB.client);
        // Tim cac subject theo admin_id
        const adminWithsubjectInfo = await subjectService.find({
            admin_id: new ObjectId(req.params.id),
        });
        if (adminWithsubjectInfo.length > 0) {
            await Promise.all(
                adminWithsubjectInfo.map(async (subject) => {
                    await subjectService.deleteAll(subject.admin_id);
                    // Tim cac questions theo subject_id
                    await questionService.deleteBySubjectId(subject._id);
                })
            );
        }

        const document = await adminService.delete(req.params.id);

        if (!document) {
            return next(new ApiError(404, "admin not found"));
        }
        return res.send({ messgae: "admin was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Could not delete admin with id=${req.params.id}`)
        );
    }
};

exports.deleteALL = async (req, res, next) => {
    try {
        const adminService = new AdminService(MongoDB.client);
        const deletedCount = await adminService.deleteAll();
        return res.send({
            message: `${deletedCount} admins were deleted successfully`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "An Error Occurred while removing all admins")
        );
    }
};
