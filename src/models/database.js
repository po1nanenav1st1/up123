const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../empathy.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Ошибка подключения к БД:', err.message);
    } else {
        console.log('Подключено к базе данных SQLite');
        
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS masters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                experience INTEGER,
                photo_url TEXT
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS services (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                price INTEGER,
                image_url TEXT,
                master_id INTEGER,
                FOREIGN KEY(master_id) REFERENCES masters(id)
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_name TEXT NOT NULL,
                client_phone TEXT NOT NULL,
                service_id INTEGER,
                appointment_date TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(service_id) REFERENCES services(id)
            )`);

            db.get(`SELECT COUNT(*) as count FROM masters`, (err, row) => {
                if (!err && row && row.count === 0) {
                    db.run(`INSERT INTO masters (name, role, experience, photo_url) VALUES 
                        ('Ева', 'Ведущий стилист', 5, '/images/about/master1.png'),
                        ('Лола', 'Топ-стилист', 7, '/images/about/master2.png'),
                        ('Айя', 'Креативный директор', 10, '/images/about/master3.png')
                    `);
                    
                    db.run(`INSERT INTO services (title, description, price, image_url, master_id) VALUES 
                        ('Макияж', 'Создаем макияж любой сложности', 2000, '/images/services/makeup.png', 2),
                        ('Стрижка', 'Идеальная форма и текстура', 1500, '/images/services/haircut.png', 2),
                        ('Маникюр', 'Превращаем ногти в искусство', 2500, '/images/services/manicure.png', 3),
                        ('Ресницы', 'Выразительный взгляд', 2000, '/images/services/lashes.png', 1),
                        ('Окрашивание', 'Любой цвет и сложные техники', 3500, '/images/services/coloring.png', 3)
                    `);
                }
            });
        });
    }
});

module.exports = db;