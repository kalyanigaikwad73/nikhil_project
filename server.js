const express = require('express');
const mysql = require('mysql2');
const crypto = require('crypto'); // Node.js In-built Security Module
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nikhil_db'
});

db.connect((err) => {
    if (err) {
        console.error('MySQL Connection Error:', err.message);
    } else {
        console.log('Successfully Connected to MySQL Database!');
    }
});

// पासवर्ड गुप्त (Hash) बनवणारा फंक्शन
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// 1. Signup API (Password Hashed in phpMyAdmin)
app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;

    // पासवर्ड Hide/Hash करणे
    const hiddenPassword = hashPassword(password);

    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(query, [name, email, hiddenPassword], (err, result) => {
        if (err) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists!' });
        }
        console.log(`--> New User Registered (Password Hidden): ${email}`);
        res.json({ success: true, message: 'Account created successfully! Password is encrypted in Database.' });
    });
});

// 2. Login API
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const hiddenPassword = hashPassword(password);

    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(query, [email, hiddenPassword], (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid Email or Password!' });
        }
        console.log(`--> User Logged In Successfully: ${email}`);
        res.json({ success: true, message: `Welcome back, ${results[0].name}!` });
    });
});

// 3. Customer Inquiry API
app.post('/api/inquiry', (req, res) => {
    const { name, phone, windowType, message } = req.body;
    const query = 'INSERT INTO inquiries (name, phone, windowType, message) VALUES (?, ?, ?, ?)';
    db.query(query, [name, phone, windowType, message], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database Error' });
        }
        const autoReply = `Thank you, ${name}! Your inquiry for '${windowType}' has been received. Our expert will contact you at ${phone}.`;
        res.json({ success: true, autoReply });
    });
});

// 4. Online Booking API
app.post('/api/book-window', (req, res) => {
    const { customerName, phone, address, windowModel, sqft, paymentMode } = req.body;
    const bookingId = "WC-" + Math.floor(100000 + Math.random() * 900000);
    const query = 'INSERT INTO bookings (bookingId, customerName, phone, address, windowModel, sqft, paymentMode) VALUES (?, ?, ?, ?, ?, ?, ?)';

    db.query(query, [bookingId, customerName, phone, address, windowModel, sqft, paymentMode], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database Error' });
        }
        const autoReply = `Order Confirmed! Booking ID: [${bookingId}]. Payment Method: ${paymentMode}. Site measurement team will visit soon.`;
        res.json({ success: true, autoReply });
    });
});

app.listen(PORT, () => {
    console.log(`================================================`);
    console.log(`WindowCraft Official Server Live at http://localhost:${PORT}`);
    console.log(`================================================`);
});