const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/v1/tickets:
 *   post:
 *     summary: Buy a ticket for a flight
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - flightNumber
 *               - date
 *               - passengerNames
 *             properties:
 *               flightNumber:
 *                 type: string
 *                 example: TK401
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-05-01"
 *               passengerNames:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Ali Veli", "Ayse Fatma"]
 *     responses:
 *       201:
 *         description: Ticket purchased successfully
 *       400:
 *         description: Sold out or bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Flight not found
 */
router.post('/', authenticateToken, ticketController.buyTicket);

module.exports = router;
