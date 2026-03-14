import express from 'express';
import { randomUUID } from 'node:crypto';
import pool from '../config/db.js';
import { authRequired, adminRequired } from '../middleware/auth.js';

const router = express.Router();

function toMysqlDatetime(input) {
  // Accept ISO/date strings or timestamps
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

router.get('/', async (req, res) => {
  try {
    const featured = req.query.featured;
    const where = featured === 'true' ? 'WHERE featured = 1' : '';
    const [rows] = await pool.query(
      `SELECT id, name, description, DATE_FORMAT(event_date, '%Y-%m-%dT%H:%i:%s.000Z') AS date, price, image_url AS image, featured
       FROM events ${where} ORDER BY event_date ASC`
    );
    res.json({ events: rows });
  } catch (err) {
    console.error('Events list error:', err);
    res.status(500).json({ message: 'Server error fetching events' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, description, DATE_FORMAT(event_date, '%Y-%m-%dT%H:%i:%s.000Z') AS date, price, image_url AS image, featured
       FROM events WHERE id = ? LIMIT 1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Event not found' });
    res.json({ event: rows[0] });
  } catch (err) {
    console.error('Event get error:', err);
    res.status(500).json({ message: 'Server error fetching event' });
  }
});

router.post('/', authRequired, adminRequired, async (req, res) => {
  try {
    const { name, description, date, price, image, featured } = req.body || {};
    if (!name || !description || !date || image == null) {
      return res.status(400).json({ message: 'Please provide name, description, date, and image' });
    }

    const eventDate = toMysqlDatetime(date);
    if (!eventDate) return res.status(400).json({ message: 'Invalid date' });

    const id = randomUUID();
    const priceVal = Number(price ?? 0);
    const featuredVal = featured ? 1 : 0;

    await pool.query(
      `INSERT INTO events (id, name, description, event_date, price, image_url, featured, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, description, eventDate, priceVal, String(image), featuredVal, req.user.id]
    );

    res.status(201).json({ message: 'Event created', eventId: id });
  } catch (err) {
    console.error('Event create error:', err);
    res.status(500).json({ message: 'Server error creating event' });
  }
});

router.patch('/:id', authRequired, adminRequired, async (req, res) => {
  try {
    const { name, description, date, price, image, featured } = req.body || {};
    const fields = [];
    const values = [];

    if (name != null) { fields.push('name = ?'); values.push(name); }
    if (description != null) { fields.push('description = ?'); values.push(description); }
    if (price != null) { fields.push('price = ?'); values.push(Number(price)); }
    if (image != null) { fields.push('image_url = ?'); values.push(String(image)); }
    if (featured != null) { fields.push('featured = ?'); values.push(featured ? 1 : 0); }
    if (date != null) {
      const eventDate = toMysqlDatetime(date);
      if (!eventDate) return res.status(400).json({ message: 'Invalid date' });
      fields.push('event_date = ?'); values.push(eventDate);
    }

    if (fields.length === 0) return res.status(400).json({ message: 'No fields to update' });

    values.push(req.params.id);
    const [result] = await pool.query(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, values);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event updated' });
  } catch (err) {
    console.error('Event update error:', err);
    res.status(500).json({ message: 'Server error updating event' });
  }
});

router.delete('/:id', authRequired, adminRequired, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error('Event delete error:', err);
    res.status(500).json({ message: 'Server error deleting event' });
  }
});

export default router;

