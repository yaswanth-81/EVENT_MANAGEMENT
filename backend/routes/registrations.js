import express from 'express';
import pool from '../config/db.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

// Get my registrations (with event details)
router.get('/me', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.id AS registrationId, r.status,
              e.id, e.name, e.description,
              DATE_FORMAT(e.event_date, '%Y-%m-%dT%H:%i:%s.000Z') AS date,
              e.price, e.image_url AS image, e.featured
       FROM registrations r
       JOIN events e ON e.id = r.event_id
       WHERE r.user_id = ? AND r.status = 'confirmed'
       ORDER BY e.event_date ASC`,
      [req.user.id]
    );
    res.json({ registrations: rows });
  } catch (err) {
    console.error('My registrations error:', err);
    res.status(500).json({ message: 'Server error fetching registrations' });
  }
});

// Register for an event. If free => confirm. If paid => create pending registration.
router.post('/events/:eventId/register', authRequired, async (req, res) => {
  const { eventId } = req.params;
  try {
    const [events] = await pool.query('SELECT id, price FROM events WHERE id = ? LIMIT 1', [eventId]);
    if (events.length === 0) return res.status(404).json({ message: 'Event not found' });

    const price = Number(events[0].price || 0);
    const {
      numPersons = 1,
      contactName = null,
      contactPhone = null,
      contactDetails = null,
    } = req.body || {};

    const safeNumPersons = Math.max(1, Number(numPersons) || 1);

    // Already registered?
    const [existing] = await pool.query(
      'SELECT id, status FROM registrations WHERE user_id = ? AND event_id = ? LIMIT 1',
      [req.user.id, eventId]
    );
    if (existing.length > 0) {
      return res.status(200).json({ message: 'Already registered', registration: existing[0] });
    }

    const status = price <= 0 ? 'confirmed' : 'pending';
    const [result] = await pool.query(
      `INSERT INTO registrations (user_id, event_id, status, num_persons, contact_name, contact_phone, contact_details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, eventId, status, safeNumPersons, contactName, contactPhone, contactDetails]
    );

    res.status(201).json({
      message: status === 'confirmed' ? 'Registration confirmed' : 'Registration pending payment',
      registrationId: result.insertId,
      status,
      requiresPayment: price > 0,
    });
  } catch (err) {
    console.error('Register for event error:', err);
    // Unique constraint (duplicate registration)
    if (err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062)) {
      return res.status(200).json({ message: 'Already registered' });
    }
    res.status(500).json({ message: 'Server error registering for event' });
  }
});

export default router;

