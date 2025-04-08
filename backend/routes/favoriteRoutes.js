const express = require('express');
const router = express.Router();
const pool = require('../db'); 
const authenticateUser = require('../middleware/authMiddleware'); // Middleware auth

// Menyimpan resep favorit
router.post('/:recipeId', authenticateUser, async (req, res) => {
    try {
        console.log("req.user: ", req.user);
        const userId = req.user.userId; 
        const { recipeId } = req.params;

        // Cek apakah resep sudah ada di favorit
        const checkFavorite = await pool.query(
            'SELECT * FROM favorites WHERE user_id = $1 AND recipe_id = $2',
            [userId, recipeId]
        );

        if (checkFavorite.rows.length > 0) {
            return res.status(400).json({ message: 'Resep sudah ada di favorit.' });
        }

        // Tambahkan ke favorit
        await pool.query(
            'INSERT INTO favorites (user_id, recipe_id) VALUES ($1, $2)',
            [userId, recipeId]
        );

        res.json({ message: 'Resep berhasil disimpan ke favorit!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Melihat daftar resep favorit user
router.get("/", authenticateUser, async (req, res) => {
    try {
        console.log("User ID dari Token:", req.user.userId); // Cek user ID
        const favorites = await pool.query(
            "SELECT recipe.* FROM favorites JOIN recipe ON favorites.recipe_id = recipe.id WHERE favorites.user_id = $1",
            [req.user.userId]
        );
        
        console.log("Resep Favorit Ditemukan:", favorites.rows); // Cek hasil query

        res.json(favorites.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});



module.exports = router;