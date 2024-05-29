const AdminService = require("../services/admin.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

const checkRole = async (req, res, next) => {
    const adminService = new AdminService(MongoDB.client);
    try {
        const adminId = req.admin.admin_id;
        const adminInfo = await adminService.findById(adminId);
        if (adminInfo.admin_role != 'admin') {
            return next(new ApiError(400, "Bạn không có quyền truy cập"));
        }
        next();
    } catch (error) {
        return next(new ApiError(500, "Không tìm thấy adminId"));
    }
};


module.exports = checkRole;