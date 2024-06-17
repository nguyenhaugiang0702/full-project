
const express = require("express");
const cors = require("cors");
const adminsRouter = require("./app/routes/admin.route");
const subjectRouter = require("./app/routes/subject.route");
const questionsRouter = require("./app/routes/question.route");
const ApiError = require("./app/api-error");
const app = express();
const config = require("./app/config");
const MongoDB = require("./app/utils/mongodb.util");

const allowedOrigins = ['https://full-project-v1.vercel.app', 'https://full-project-six.vercel.app'];

app.options('*', cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());
app.use("/api/admin", adminsRouter);
app.use("/api/subject", subjectRouter);
app.use("/api/question", questionsRouter)


app.get("/", (req, res) => {
    res.json({ message: "Welcome to random-questions" });
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

async function startServer() {
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
}

startServer();

module.exports = app;