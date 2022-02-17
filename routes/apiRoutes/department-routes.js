const express = require('express');
const router = express.Router();
const db = require('../../db/connection');

// GET all departments.
router.get('/', (req, res) => {
    const sql = `select * from department order by name`;

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