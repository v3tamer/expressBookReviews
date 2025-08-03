const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

app.use("/customer/auth/*", function auth(req, res, next) {
    // 1. محاولة جلب التوكن من الجلسة
    let token = null;
    if (req.session && req.session.authorization) {
        token = req.session.authorization['accessToken'];
    }

    // 2. أو جلبه من الهيدر (للتوافق مع تطبيقات أخرى)
    if (!token && req.headers.authorization) {
        // توقع صيغة: Bearer <token>
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }

    // 3. إذا لا يوجد توكن
    if (!token) {
        return res.status(401).json({ message: "Access token missing. Please login." });
    }

    // 4. تحقق من صلاحية التوكن
    jwt.verify(token, "fingerprint_customer", (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token." });
        }
        // اجعل بيانات المستخدم متاحة للمسارات المحمية
        req.user = user;
        next();
    });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
