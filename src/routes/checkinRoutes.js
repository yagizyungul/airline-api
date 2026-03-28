const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkinController');

/**
 * @swagger
 * /api/v1/checkin:
 *   post:
 *     summary: Check in a passenger for a flight
 *     tags: [Check-in]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - flightNumber
 *               - date
 *               - passengerName
 *             properties:
 *               flightNumber:
 *                 type: string
 *                 example: TK401
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-05-01"
 *               passengerName:
 *                 type: string
 *                 example: Ali Veli
 *     responses:
 *       200:
 *         description: Check-in successful, seat number assigned
 *       400:
 *         description: Bad request
 *       404:
 *         description: Passenger or flight not found
 */
router.post('/', checkinController.checkIn);

module.exports = router;
