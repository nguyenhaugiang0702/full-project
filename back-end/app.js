
const express = require("express");
const cors = require("cors");
const adminsRouter = require("./app/routes/admin.route");
const subjectRouter = require("./app/routes/subject.route");
const questionsRouter = require("./app/routes/question.route");
const ApiError = require("./app/api-error");
// const startServer = require('./index');
const app = express();
const config = require("./app/config");
const MongoDB = require("./app/utils/mongodb.util");
app.use(cors());
app.use(express.json());
app.use("/api/admin", adminsRouter);
app.use("/api/subject", subjectRouter);
app.use("/api/question", questionsRouter)


app.get("/home", (req, res) => {
    res.json({ message: "Welcome to contact book application" });
});

// handle 404 response
app.use((req, res, next) => {
    // Code ở đây sẽ chạy khi không có route được định nghĩa nào
    // khớp với yêu cầu. Gọi next() để chuyển sang middleware xử lý lỗi
    return next(new ApiError(404, "Resource not found"));
});

// define error-handling middleware last, after other app.use() and routes calls
app.use((err, req, res, next) => {
    // Middleware xử lý lỗi tập trung.
    // Trong các đoạn code xử lý ở các route, gọi next(error)
    // sẽ chuyển về middleware xử lý lỗi này
    return res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
    });
});

try {
    await MongoDB.connect(config.db.uri);
    console.log('Connected to the DB')
    const PORT = config.app.port;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
} catch (error) {
    console.log("Can not connect to the DB !!!", error);
    process.exit();
}

module.exports = app;