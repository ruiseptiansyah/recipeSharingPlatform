const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Ambil token setelah "Bearer"

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Cek apakah token valid
        req.user = decoded; // Simpan data user di req.user
        console.log('Decoded Token:', decoded); // Cek hasil decode
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Forbidden: Invalid Token' });
    }
};

module.exports = authMiddleware;
