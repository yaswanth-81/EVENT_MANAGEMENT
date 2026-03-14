import express from 'express';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import pool from '../config/db.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

router.post('/razorpay/order', authRequired, async (req, res) => {
  try {
    const { eventId } = req.body || {};
    if (!eventId) return res.status(400).json({ message: 'eventId is required' });

    const [events] = await pool.query('SELECT id, name, price FROM events WHERE id = ? LIMIT 1', [eventId]);
    if (events.length === 0) return res.status(404).json({ message: 'Event not found' });

    const price = Number(events[0].price || 0);
    if (price <= 0) return res.status(400).json({ message: 'This event does not require payment' });

    // Ensure a pending registration exists (idempotent-ish)
    let registrationId = null;
    const [existingRegs] = await pool.query(
      'SELECT id, status, payment_id, num_persons FROM registrations WHERE user_id = ? AND event_id = ? LIMIT 1',
      [req.user.id, eventId]
    );
    if (existingRegs.length === 0) {
      // Should not normally happen because /registrations/.../register is called first,
      // but we guard and create a minimal pending registration.
      const [regResult] = await pool.query(
        "INSERT INTO registrations (user_id, event_id, status, num_persons) VALUES (?, ?, 'pending', 1)",
        [req.user.id, eventId]
      );
      registrationId = regResult.insertId;
    } else {
      registrationId = existingRegs[0].id;
      if (existingRegs[0].status === 'confirmed') {
        return res.status(200).json({ message: 'Already paid/confirmed' });
      }
    }

    const [regRows] = await pool.query(
      'SELECT num_persons FROM registrations WHERE id = ? LIMIT 1',
      [registrationId]
    );
    const numPersons = regRows.length ? Math.max(1, Number(regRows[0].num_persons) || 1) : 1;
    const amountPaise = Math.round(price * numPersons * 100);
    const client = getRazorpayClient();
    if (!client) return res.status(500).json({ message: 'Razorpay is not configured on the server' });

    // Razorpay requires receipt length <= 40 chars
    const shortEvent = String(eventId).slice(0, 8);
    const shortUser = String(req.user.id).slice(0, 6);
    const shortTime = Date.now().toString().slice(-6);
    const receipt = `e${shortEvent}_u${shortUser}_${shortTime}`.slice(0, 40);

    const order = await client.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes: { eventId, userId: String(req.user.id), registrationId: String(registrationId) },
    });

    const [payResult] = await pool.query(
      `INSERT INTO payments (user_id, event_id, provider, amount_paise, currency, razorpay_order_id, status)
       VALUES (?, ?, 'razorpay', ?, 'INR', ?, 'created')`,
      [req.user.id, eventId, amountPaise, order.id]
    );

    await pool.query('UPDATE registrations SET payment_id = ? WHERE id = ?', [payResult.insertId, registrationId]);

    res.status(201).json({
      keyId: process.env.RAZORPAY_KEY_ID,
      order: { id: order.id, amount: order.amount, currency: order.currency },
      paymentId: payResult.insertId,
      registrationId,
    });
  } catch (err) {
    console.error('Razorpay order error:', err);
    res.status(500).json({ message: 'Server error creating payment order' });
  }
});

// Verify payment from frontend (dev-friendly when webhooks are unavailable)
// Expects razorpay_order_id, razorpay_payment_id, razorpay_signature
router.post('/razorpay/verify', authRequired, async (req, res) => {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) return res.status(500).json({ message: 'Razorpay secret not configured on the server' });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing Razorpay verification fields' });
    }

    const expected = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const [payments] = await pool.query(
      'SELECT id, user_id, event_id FROM payments WHERE razorpay_order_id = ? LIMIT 1',
      [razorpay_order_id]
    );
    if (payments.length === 0) return res.status(404).json({ message: 'Payment order not found' });

    const pay = payments[0];
    if (Number(pay.user_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Not allowed to verify this payment' });
    }

    await pool.query(
      `UPDATE payments
       SET status = 'paid', razorpay_payment_id = ?, razorpay_signature = ?
       WHERE id = ?`,
      [razorpay_payment_id, razorpay_signature, pay.id]
    );

    await pool.query("UPDATE registrations SET status = 'confirmed' WHERE payment_id = ?", [pay.id]);

    res.json({ message: 'Payment verified', paymentId: pay.id });
  } catch (err) {
    console.error('Razorpay verify error:', err);
    res.status(500).json({ message: 'Server error verifying payment' });
  }
});

// Webhook endpoint (called by Razorpay servers)
router.post('/razorpay/webhook', express.json({ type: '*/*' }), async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) return res.status(500).json({ message: 'Webhook secret not configured' });

    const signature = req.headers['x-razorpay-signature'];
    const bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const expected = crypto.createHmac('sha256', webhookSecret).update(bodyString).digest('hex');

    if (!signature || expected !== signature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const eventType = req.body?.event;
    const payload = req.body?.payload || {};

    if (eventType === 'payment.captured') {
      const payment = payload.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;
      const amount = payment?.amount;
      const currency = payment?.currency || 'INR';

      if (!orderId || !paymentId) return res.status(200).json({ status: 'ignored' });

      // Mark payment as paid and confirm registration
      const [payments] = await pool.query(
        'SELECT id, user_id, event_id FROM payments WHERE razorpay_order_id = ? LIMIT 1',
        [orderId]
      );
      if (payments.length === 0) return res.status(200).json({ status: 'unknown_order' });

      const payRow = payments[0];

      await pool.query(
        `UPDATE payments
         SET status = 'paid', razorpay_payment_id = ?, amount_paise = ?, currency = ?
         WHERE id = ?`,
        [paymentId, amount, currency, payRow.id]
      );

      await pool.query(
        "UPDATE registrations SET status = 'confirmed' WHERE payment_id = ?",
        [payRow.id]
      );
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Razorpay webhook error:', err);
    res.status(500).json({ message: 'Server error processing webhook' });
  }
});

export default router;

