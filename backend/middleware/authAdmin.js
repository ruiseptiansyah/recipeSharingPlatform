const jwt = require('jsonwebtoken');
require('dotenv').config();

const authAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Ambil token setelah "Bearer"

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Cek apakah token valid
        req.user = decoded; // Simpan data user di req.user

        console.log('Decoded Token:', decoded); // Log hasil decode untuk debugging

        if (!req.user.role) {
            return res.status(403).json({ message: 'Forbidden: Role information missing' });
        }        

        // Cek apakah user memiliki role "admin"
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admin access required' });
        }

        next(); // Lanjut ke route berikutnya
    } catch (error) {
        return res.status(403).json({ message: 'Forbidden: Invalid Token' });
    }
};

module.exports = authAdmin;
