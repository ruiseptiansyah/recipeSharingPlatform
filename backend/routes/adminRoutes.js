const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const authenticateAdmin = require('../middleware/authAdmin');
const router = express.Router();

router.post('/register', async (req, res) => {
    try {

        const { username, email, password } = req.body;
        console.log("Got everything u need? (username, email, password): ", username, email, password);

        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({message: "Username/Email telah terdaftar"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = await pool.query(
            "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, 'admin') RETURNING *",
            [username, email, hashedPassword]
        );

        res.status(201).json({message: "Admin berhasil terdaftarkan", admin: newAdmin.rows[0] });

    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error di POST /register"});
    }
});

router.post('/login', async (req, res) => {
    try {

        const { username, password } = req.body;
        const admin = await pool.query("SELECT * FROM users WHERE username = $1 AND role = $2", [username, 'admin']);

        console.log("got username?: ", username);
        console.log("got password?: ", password);
        console.log("got admin queue?: ", admin);

        if (admin.rows.length === 0) {
            return res.status(401).json({message: "Invalid credentials, username salah"});
        }

        const isMatch = await bcrypt.compare(password, admin.rows[0].password);
        console.log("is it match?: ", isMatch);
        if (!isMatch) {
            return res.status(401).json({message: "Invalid credentials, password salah"});
        }

        const token = jwt.sign(
            { adminId: admin.rows[0].id, role: admin.rows[0].role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        res.json({ token });

    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error at POST /login"});
    }
});

router.get('/dashboard', authenticateAdmin, async (req, res) => {
    try {

        const popularRecipes = await pool.query(`
            SELECT r.recipe_id, rc.title, COUNT(*) AS rating_count
            FROM ratings r
            JOIN recipe rc ON r.recipe_id = rc.id
            GROUP BY r.recipe_id, rc.title
            ORDER BY rating_count DESC
            LIMIT 3
          `);          
        const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
        const totalRecipes = await pool.query('SELECT COUNT(*) FROM recipe');
        const topCategories = await pool.query(
            'SELECT category, COUNT(*) AS count FROM recipe GROUP BY category ORDER BY count DESC LIMIT 3'
        );
        const avgRatings = await pool.query(
            'SELECT recipe_id, AVG(rating) AS average_rating FROM ratings GROUP BY recipe_id ORDER BY average_rating DESC LIMIT 5'
        );

        res.json({
            popularRecipes: popularRecipes.rows,
            totalUsers: totalUsers.rows[0].count,
            totalRecipes: totalRecipes.rows[0].count,
            topCategories: topCategories.rows,
            avgRatings: avgRatings.rows
        });

    } catch (error){
        console.error(error);
        res.status(500).json({message: "Server error di GET /dashboard"});
    }
});

router.get('/users', authenticateAdmin, async (req, res) => {
    const users = await pool.query('SELECT id, username, email , role FROM users');
    res.json(users.rows);
});

router.delete('/users/:id', authenticateAdmin, async (req, res) => {
    try {

        const { id } = req.params;

        const userCheck = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

        if (userCheck.rows.length === 0) {
            return res.status(404).json({message: "User not found"});
        }

        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({message: "user deleted successfully!"})

    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server gagal di DELETE /user/:id"});
    }
});

router.put('/users/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { username, email } = req.body;

    try {
        // Cek apakah user dengan ID ini ada
        const userCheck = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

        if (userCheck.rows.length === 0) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        // Cek apakah email sudah digunakan oleh user lain
        const emailCheck = await pool.query(
            "SELECT * FROM users WHERE email = $1 AND id != $2",
            [email, id]
        );

        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ message: "Email sudah digunakan oleh pengguna lain" });
        }

        // Update data user
        const updatedUser = await pool.query(
            "UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING *",
            [username, email, id]
        );

        res.json({ message: "User berhasil diperbarui", user: updatedUser.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Gagal memperbarui user di server" });
    }
});



router.get('/recipes', authenticateAdmin, async (req, res) => {
    const recipes = await pool.query('SELECT * FROM recipe');
    res.json(recipes.rows);
});

router.delete('/recipes/:id', authenticateAdmin, async (req, res) => {
    try {

        const { id } = req.params;

        const recipeCheck = await pool.query(
            'SELECT * FROM recipe WHERE id = $1', [id]
        )

        if (recipeCheck.rows.length === 0) {
            return res.status(404).json({message: "Resep not exist"});
        }

        await pool.query('DELETE FROM recipe WHERE id = $1', [id])
        res.json({message: "Recipe deleted successfully"});

    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error at DELETE /recipe/:id"});
    }
});

module.exports = router;