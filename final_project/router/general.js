const express = require('express');
const axios = require('axios'); // إضافة axios

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists. Please choose another." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// async/await - المهمة 10
public_users.get('/asyncbooks', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch books asynchronously.", error: error.message });
  }
});

// async/await - المهمة 11: جلب كتاب حسب رقم ISBN باستخدام axios
public_users.get('/asyncisbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ message: `Book not found with ISBN: ${req.params.isbn}` });
    } else {
      res.status(500).json({ message: "Failed to fetch book asynchronously.", error: error.message });
    }
  }
});

// المهمة 12: جلب تفاصيل الكتب حسب المؤلف باستخدام Axios (Promises then/catch)
public_users.get('/asyncauthor/:author', (req, res) => {
  const author = req.params.author;
  axios
    .get(`http://localhost:5000/author/${encodeURIComponent(author)}`)
    .then(response => {
      if (response.data && response.data.length > 0) {
        res.status(200).json(response.data);
      } else {
        res.status(404).json({ message: `No books found for author: ${author}` });
      }
    })
    .catch(error => {
      if (error.response && error.response.status === 404) {
        res.status(404).json({ message: `No books found for author: ${author}` });
      } else {
        res.status(500).json({ message: "Failed to fetch books by author asynchronously.", error: error.message });
      }
    });
});

// المهمة 13: جلب تفاصيل الكتاب حسب العنوان باستخدام Axios (async/await)
public_users.get('/asynctitle/:title', async (req, res) => {
    try {
      const title = req.params.title;
      // لاحظ أنك تتصل بنفس السيرفر لإعادة استخدام منطق البحث الموجود مسبقاً
      const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
      res.status(200).json(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        res.status(404).json({ message: `No books found with title: ${req.params.title}` });
      } else {
        res.status(500).json({ message: "Failed to fetch book by title asynchronously.", error: error.message });
      }
    }
  });
  

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found with ISBN: " + isbn });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const allBooks = Object.values(books);
  const booksByAuthor = allBooks.filter(book => book.author === author);

  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor);
  } else {
    return res.status(404).json({ message: `No books found for author: ${author}` });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const allBooks = Object.values(books);
  const booksByTitle = allBooks.filter(book => book.title === title);

  if (booksByTitle.length > 0) {
    return res.status(200).json(booksByTitle);
  } else {
    return res.status(404).json({ message: `No books found with title: ${title}` });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found with ISBN: " + isbn });
  }
});

module.exports.general = public_users;
