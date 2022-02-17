const express = require('express');
const router = express.Router();
const db = require('../../db/connection');

// GET all employees.
router.get('/', (req, res) => {
    const sql = `select * from employee order by last_name desc`;

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