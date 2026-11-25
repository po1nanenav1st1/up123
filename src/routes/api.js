const express = require('express');
const router = express.Router();
const db = require('../models/database');

router.post('/book', (req, res) => {
    const { name, phone, service, date } = req.body;

    if (!name || !phone || !service || !date) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }

    db.get(`SELECT id FROM services WHERE title = ?`, [service], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (!row) {
            return res.status(400).json({ error: 'Услуга не найдена в базе: ' + service });
        }

        const service_id = row.id;

        db.get(`SELECT id FROM appointments WHERE service_id = ? AND appointment_date = ?`, [service_id, date], (err, existingAppointment) => {
            if (err) return res.status(500).json({ error: err.message });

            if (existingAppointment) {
                return res.status(400).json({ error: 'На эту дату уже есть запись на данную услугу.' });
            }

            const query = `INSERT INTO appointments (client_name, client_phone, service_id, appointment_date) VALUES (?, ?, ?, ?)`;
            
            db.run(query, [name, phone, service_id, date], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: 'Запись успешно создана', id: this.lastID });
            });
        });
    });
});

router.get('/busy-dates/:service', (req, res) => {
    const serviceTitle = req.params.service;
    
    db.get(`SELECT id FROM services WHERE title = ?`, [serviceTitle], (err, serviceRow) => {
        if (err || !serviceRow) return res.json([]);
        
        db.all(`SELECT appointment_date FROM appointments WHERE service_id = ?`, [serviceRow.id], (err, rows) => {
            if (err) return res.json([]);
            res.json(rows.map(r => r.appointment_date));
        });
    });
});

router.get('/all', (req, res) => {
    db.all(`SELECT a.id, a.client_name, a.client_phone, s.title as service, a.appointment_date, a.created_at 
            FROM appointments a 
            LEFT JOIN services s ON a.service_id = s.id`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;