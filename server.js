const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: 'uploads/' })
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/user');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = 'your_secret_key';

// MongoDB connection
mongoose.connect('mongodb+srv://jpicweb:lGIdYUTDg252q8Zx@jpic.5crpoy8.mongodb.net/?retryWrites=true&w=majority&appName=jpic');

const photoSchema = new mongoose.Schema({
    filename: String,
    path: String,
    originalName: String,
    createdAt: { type: Date, default: Date.now },
    category: String,
    title: String,
    description: String
});

const Photo = mongoose.model('Photo', photoSchema);

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// const upload = multer({ storage: storage });

// Middleware to protect routes
const protect = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).send('Not authorized, no token');

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        res.status(401).send('Not authorized, token failed');
    }
};

const admin = (req, res, next) => {
    if (req.data.user && req.data.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Not authorized as admin');
    }
};

// User registration
app.post('/api/users/register', async (req, res) => {
    const { username, password, role } = req.body;
    const user = new User({ username, password, role });
    await user.save();
    res.send(user);
});

// User login
app.post('/api/users/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && (await user.matchPassword(password))) {
        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
        res.send({ token, user });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

app.get('/api/users', async (req, res) => {
    const reqQuery = req.query;
    const userId = Object?.keys(reqQuery)
    if (userId) {
        const user = await User.findOne({_id : userId });
        res.send({  user })}
    else {
        res.status(403).send('user not found');
    }
});

// Routes
app.post('/api/photos', upload.single('photo'), async (req, res) => {
    const photo = new Photo({
        filename: req.file.filename,
        path: req.file.path,
        originalName: req.file.originalname,
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
    });
    await photo.save();
    res.send(photo);
});

app.get('/api/photos', async (req, res) => {
    const photos = await Photo.find();
    res.send(photos);
});

app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
