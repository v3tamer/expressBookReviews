const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // تحقق من توفر اسم المستخدم وكلمة المرور
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // تحقق من صحة بيانات المستخدم
  const user = users.find(user => user.username === username && user.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  // إصدار JWT وحفظه في الجلسة
  const accessToken = jwt.sign(
    { username },          // يمكن تضمين بيانات إضافية إذا لزم الأمر
    "fingerprint_customer",
    { expiresIn: '1h' }
  );

  // حفظ التوكن في الجلسة
  req.session.authorization = { accessToken };

  return res.status(200).json({ message: "Login successful.", accessToken });
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review; // المراجعة يتم إرسالها كـ query param
    const username = req.user?.username || req.session.authorization?.username; // اسم المستخدم من التوكن/الجلسة
  
    // تحقق من وجود المستخدم
    if (!username) {
      return res.status(401).json({ message: "Unauthorized. Please login first." });
    }
  
    // تحقق من وجود الكتاب
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found with ISBN: " + isbn });
    }
  
    if (!review) {
      return res.status(400).json({ message: "Review is required as query parameter." });
    }
  
    // أضف أو عدل مراجعة المستخدم لهذا الكتاب
    books[isbn].reviews[username] = review;
  
    return res.status(200).json({ message: "Review added/updated successfully.", reviews: books[isbn].reviews });
  });

  regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user?.username || req.session.authorization?.username;

  // تحقق من وجود المستخدم
  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please login first." });
  }

  // تحقق من وجود الكتاب
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found with ISBN: " + isbn });
  }

  // تحقق من أن للمستخدم مراجعة على هذا الكتاب
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review found for this user on this book." });
  }

  // احذف مراجعة المستخدم فقط
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully." });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
