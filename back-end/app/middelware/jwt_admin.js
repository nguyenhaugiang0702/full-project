const jwt = require('jsonwebtoken');
const ApiError = require("../api-error");

// Hàm để xác thực token từ header
function authenticateTokenFromHeader(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return next(new ApiError(403, "Vui lòng kiểm tra lại token"));

    jwt.verify(token, 'my_secret_key_admin', (err, admin) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return next(new ApiError(401, "Phiên làm việc hết hạn, vui lòng đăng nhập lại"));
            } else {
                return next(new ApiError(403, "Vui lòng kiểm tra lại"));
            }
        }
        req.admin = admin;
        next();
    });
}

// Hàm để xác thực token từ route params
function authenticateTokenFromParams(req, res, next) {
    const token = req.params.token;
    if (!token) return next(new ApiError(403, "Vui lòng kiểm tra lại token"));

    jwt.verify(token, 'my_secret_key_admin', (err, admin) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return next(new ApiError(401, "Phiên làm việc hết hạn, vui lòng đăng nhập lại"));
            } else {
                return next(new ApiError(403, "Vui lòng kiểm tra lại"));
            }
        }
        req.admin = admin;
        next();
    });
}

// Hàm để xác thực token từ route params
function authenticateTokenFromParamsWithEmail(req, res, next) {
    const token = req.params.token;
    if (!token) return next(new ApiError(403, "Vui lòng kiểm tra lại token"));

    jwt.verify(token, 'my_secret_key_admin_email', (err, email) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return next(new ApiError(401, "Phiên làm việc hết hạn, vui lòng kiểm tra lại email"));
            } else {
                return next(new ApiError(403, "Vui lòng kiểm tra lại"));
            }
        }
        req.admin = email;
        next();
    });
}

module.exports = { authenticateTokenFromHeader, authenticateTokenFromParams, authenticateTokenFromParamsWithEmail };
