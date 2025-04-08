const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt= require("bcryptjs");
const pool = require("../db");
const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

//Register
router.post("/register", async (req, res) => {
    const {username, email, password} = req.body;

    try {
        //Checking email
        const checkUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ message: "email already registered"});
        }

        //hashing pass
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
            [username, email, hashedPassword]
        );

        res.status(201).json({message: "User registered successfully", user: newUser.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "server error"});
    }
});

//Login
router.post("/login", async (req, res) => {
    const {email, password} = req.body;

    try{
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) {
            return res.status(401).json({message: "Invalid credential"});
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(401).json({message: "Invalid credential"});
        }

        const token = jwt.sign(
            { userId: user.rows[0].id }, 
            process.env.JWT_SECRET, // Ambil dari .env
            { expiresIn: "1h" }
        );        
        
        res.json({message: "Login succesfull", token, user: { id: user.rows[0].id, username: user.rows[0].username } });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
});

//Profile
router.get('/profile', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.userId;

        const userProfile = await pool.query(
            'SELECT username, email, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (userProfile.rows.length === 0){
            return res.status(404).json({message: "User tidak ditemukan"});
        }

        res.json(userProfile.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error di GET /profile"});
    }
});

router.get('/my-recipes', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.userId;

        const myRecipes = await pool.query(
            'SELECT * FROM recipe WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        res.json(myRecipes.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error di GET my-recipes"});
    }
});

router.put('/edit-profile', authenticateUser, async (req, res) => {

    try {
        
        const userId = req.user.userId;
        const { username, email } = req.body;
        
        const updateUser = await pool.query(
            'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email',
            [username, email, userId]
        );
        
        console.log('User ID:', userId);
        console.log('Updated Data:', { username, email });
        
        if (updateUser.rowCount === 0) {
            return res.status(400).json({message: "Tidak terjadi perubahan"})
        }
        
        res.json({ message: "Profile berhasil di perbarui", user: updateUser.rows[0]});
        
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error di PUT edit-profile"});
    }
})

router.put('/change-password', authenticateUser, async (req, res) => {
    try {

        const userId = req.user.userId;
        const { oldPassword, newPassword } = req.body;

        const userQuery = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
        if (userQuery.rows.length === 0) {
            return res.status(404).json({message: "User tidak ditemukan"});
        }

        const storedPassword = userQuery.rows[0].password;

        const isMatch = await bcrypt.compare(oldPassword, storedPassword);
        if (!isMatch) {
            return res.status(400).json({message: "Password lama salah"});
        }

        const isSamePassword = await bcrypt.compare(newPassword, storedPassword);
        if (isSamePassword) {
            return res.status(400).json({message: "Password tidak boleh sama dengan yang lama,"});
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedNewPassword, userId]);

        res.json({message: "Password berhasil diubah"})

    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error di PUT /change-password"});
    }
})

module.exports = router;