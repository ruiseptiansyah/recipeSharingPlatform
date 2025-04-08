require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const express = require('express');
const pool = require('./db'); // Import koneksi database
const cors = require('cors');
const app = express();
const useRoutes = require('./routes/userRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    next();
});

app.use(cors());
app.use(express.json());
app.use('/api/users', useRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/admin', adminRoutes);

// Tes koneksi database saat server dijalankan
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database Connection Error:', err);
    } else {
        console.log('✅ Database Connected at', res.rows[0].now);
    }
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
