const express = require('express');
const router = express.Router();
const db = require('../../db/connection');

// GET all roles.
router.get('/', (req, res) => {
    const sql = `select * from role order by title desc`;

    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: rows,
        });
    });
});


module.exports = router;
