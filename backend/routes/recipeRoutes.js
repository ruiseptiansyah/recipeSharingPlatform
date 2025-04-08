const express = require('express');
const pool = require('../db'); // Koneksi ke database
const router = express.Router();
const authenticateUser = require('../middleware/authMiddleware');
const { parse } = require('dotenv');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Rename file dengan timestamp agar unik
    }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), authenticateUser, async (req, res) => {
    try {
        console.log("Incoming request to create recipe...");
        console.log("Request body:", req.body);
        console.log("File received:", req.file); // Cek apakah file diterima

        const { title, ingredients, instructions, category } = req.body;
        const userId = req.user.userId; // ID user dari token

        if (!title || !ingredients || !instructions) {
            console.log("Validation error: Some fields are missing");
            return res.status(400).json({ message: 'Semua field wajib diisi' });
        }

        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        console.log("Image Path:", imageUrl);

        const newRecipe = await pool.query(
            'INSERT INTO recipe (user_id, title, ingredients, instructions, category, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, title, ingredients, instructions, category, imageUrl]
        );

        console.log("Recipe created successfully:", newRecipe.rows[0]);

        res.status(201).json(newRecipe.rows[0]);
    } catch (error) {
        console.error("Error in creating recipe:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});


router.put('/:id', authenticateUser, async (req, res) => {
    try {
        console.log("Full Request URL:", req.originalUrl);
        console.log("User dari Token Middleware:", req.user);
        console.log(req.params);
        console.log("Params ID sebelum parsing:", req.params.id);
        const id = parseInt(req.params.id, 10);
        console.log("Params ID setelah parsing:", id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid recipe ID" });
        }

        const { title, ingredients, instructions, category } = req.body;
        const userId = req.user.userId; // ID user dari token

        // Cek apakah resep ada di database
        const recipeQuery = await pool.query('SELECT * FROM recipe WHERE id = $1', [id]);

        if (recipeQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Resep tidak ditemukan' });
        }

        const recipe = recipeQuery.rows[0];

        console.log("Resep Ditemukan:", recipe);
        console.log("User ID Resep:", recipe.user_id, "User ID Token:", userId);

        // Cek apakah resep dimiliki oleh user yang sedang login
        if (parseInt(recipe.user_id) !== parseInt(userId)) {
            return res.status(403).json({ message: 'Anda tidak berhak mengedit resep ini' });
        }

        // Update resep
        const updatedRecipe = await pool.query(
            'UPDATE recipe SET title = $1, ingredients = $2, instructions = $3, category = $4 WHERE id = $5 RETURNING *',
            [title, ingredients, instructions, category, id]
        );

        res.json(updatedRecipe.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const recipe = await pool.query(
            'SELECT * FROM recipe WHERE id = $1', [id]
        );

        if ( recipe.rows.length === 0 ) {
            return res.status(404).json({message: "Resep tidak ditemukan (dari backend)"});
        }

        if (recipe.rows[0].user_id !== userId) {
            return res.status(403).json({message: "Anda tidak berhak menghapus resep ini"});
        }

        await pool.query('DELETE FROM recipe WHERE id = $1', [id]);

        res.json({message: "Resep berhasil dihapus!"});
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Server Error"});
    }
});

router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Ambil query params (default: page=1, limit=10)
        const offset = (page - 1) * limit; // Hitung offset untuk pagination

        const recipes = await pool.query(
            'SELECT * FROM recipe ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        // Ambil total jumlah resep untuk pagination metadata
        const totalRecipes = await pool.query('SELECT COUNT(*) FROM recipe');

        res.json({
            total: totalRecipes.rows[0].count, // Total jumlah resep
            page: parseInt(page),
            limit: parseInt(limit),
            data: recipes.rows, // Data resep
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/recipes/:id - Ambil 1 resep berdasarkan ID
router.get('/:id', async (req, res) => {
    try {
      const recipeId = parseInt(req.params.id, 10);
  
      if (isNaN(recipeId)) {
        return res.status(400).json({ message: 'Invalid recipe ID' });
      }
  
      const result = await pool.query('SELECT * FROM recipe WHERE id = $1', [recipeId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Resep tidak ditemukan' });
      }
  
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error mengambil resep:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;

        const recipeByCategory = await pool.query(
            'SELECT * FROM recipe WHERE category ILIKE $1 ORDER BY created_at DESC',
            [category]
        );
        
        if (recipeByCategory.rows.length === 0) {
            return res.status(404).json({message: "Resep dengan kategori ini tidak ditemukan."});
        }

        res.json(recipeByCategory.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"});
    }
    
});

router.get('/ingredients/:ingredients', async (req, res) => {
    try {
        const { ingredients } = req.params;

        const recipeByIngredients = await pool.query(
            "SELECT * FROM recipe WHERE ingredients ILIKE $1 ORDER BY created_at DESC",
            [`%${ingredients}%`]
        );

        if (recipeByIngredients.rows.length === 0) {
            return res.status(404).json({message: "Resep dengan bahan ini tidak ada."});
        }

        res.json(recipeByIngredients.rows);
    } catch(error) {
        console.log(error);
        res.status(500).json({message: "Server Error"});
    }
});

router.get('/filter', async (req, res) => {
    try {
        console.log('Received request:', req.url);
        
        const { category, ingredient, sortBy, order } = req.query;
        let query = 'SELECT * FROM recipe';
        let conditions = [];
        let values = [];

        if (category) {
            conditions.push('category ILIKE $' + (values.length + 1));
            values.push(category);
        }

        if (ingredient) {
            conditions.push('ingredients ILIKE $' + (values.length + 1));
            values.push(`%${ingredient}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Sorting
        if (sortBy) {
            const validSortColumns = ['created_at', 'rating']; // Kolom yang bisa digunakan untuk sorting
            if (!validSortColumns.includes(sortBy)) {
                return res.status(400).json({ message: 'Invalid sortBy value' });
            }

            const sortOrder = order === 'asc' ? 'ASC' : 'DESC'; // Default DESC
            query += ` ORDER BY ${sortBy} ${sortOrder}`;
        }

        console.log('Final Query:', query);
        console.log('Values:', values);

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server problem' });
    }
});

router.post('/:id/comment', authenticateUser, async (req, res) => {
    try {
        const recipeId = parseInt(req.params.id, 10);
        const userId = req.user.userId;
        const { comment } = req.body;

        if (!comment) {
            return res.status(400).json({message: "Komentar tidak boleh kosong"});
        }

        const newComment = await pool.query(
            'INSERT INTO comments (recipe_id, user_id, comment) VALUES ( $1, $2, $3 ) RETURNING *',
            [recipeId, userId, comment]
        );

        res.status(201).json(newComment.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error di comment"});
    }
});

router.get('/:id/comments', async (req, res) => {
    try {
        const recipeId = parseInt(req.params.id, 10);

        const comments = await pool.query(
            'SELECT c.id, c.comment, c.created_at, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE c.recipe_id = $1 ORDER BY c.created_at DESC',
            [recipeId]
        );

        res.json(comments.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error di get comment"});
    }
})

router.post('/:id/rate', authenticateUser, async (req, res) => {
    try {
        const recipeId = parseInt(req.params.id, 10);
        const userId = req.user.userId;
        const { rating } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({message: "Rating hanya diantara 1 hingga 5"});
        }

        const newRating = await pool.query (
            'INSERT INTO ratings (recipe_id, user_id, rating) VALUES ($1, $2, $3) ON CONFLICT (recipe_id, user_id) DO UPDATE SET rating = EXCLUDED.rating RETURNING *',
            [recipeId, userId, rating]
        );

        res.status(201).json(newRating.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error di post Rate"});
    }
});

router.get('/:id/rating', async (req, res) => {
    try {
        const recipeId = parseInt(req.params.id, 10);

        const avgRating = await pool.query (
            'SELECT COALESCE(AVG(rating), 0) AS average_rating FROM ratings WHERE recipe_id = $1',
            [recipeId]
        );

        res.json({average_rating: avgRating.rows[0].average_rating});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Server error di GET ratings"});
    }
})

module.exports = router;
