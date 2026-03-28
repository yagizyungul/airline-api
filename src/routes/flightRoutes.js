const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const flightController = require('../controllers/flightController');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/v1/flights:
 *   post:
 *     summary: Add a new flight
 *     tags: [Flights]
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
 *               - dateFrom
 *               - dateTo
 *               - airportFrom
 *               - airportTo
 *               - duration
 *               - capacity
 *             properties:
 *               flightNumber:
 *                 type: string
 *                 example: TK401
 *               dateFrom:
 *                 type: string
 *                 format: date
 *                 example: "2025-05-01"
 *               dateTo:
 *                 type: string
 *                 format: date
 *                 example: "2025-05-01"
 *               airportFrom:
 *                 type: string
 *                 example: IST
 *               airportTo:
 *                 type: string
 *                 example: AYT
 *               duration:
 *                 type: integer
 *                 example: 80
 *               capacity:
 *                 type: integer
 *                 example: 150
 *     responses:
 *       201:
 *         description: Flight added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, flightController.addFlight);

/**
 * @swagger
 * /api/v1/flights/upload:
 *   post:
 *     summary: Add flights by CSV file upload
 *     tags: [Flights]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Flights processed successfully
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 */
router.post('/upload', authenticateToken, upload.single('file'), flightController.uploadFlights);

/**
 * @swagger
 * /api/v1/flights:
 *   get:
 *     summary: Query available flights
 *     tags: [Flights]
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *       - in: query
 *         name: airportFrom
 *         schema:
 *           type: string
 *         description: Departure airport code
 *       - in: query
 *         name: airportTo
 *         schema:
 *           type: string
 *         description: Arrival airport code
 *       - in: query
 *         name: numberOfPeople
 *         schema:
 *           type: integer
 *         description: Number of passengers
 *       - in: query
 *         name: tripType
 *         schema:
 *           type: string
 *           enum: [oneway, roundtrip]
 *         description: Trip type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of available flights
 *       429:
 *         description: Rate limit exceeded (3 queries per day)
 */
router.get('/', flightController.queryFlights);

/**
 * @swagger
 * /api/v1/flights/{flightNumber}/passengers:
 *   get:
 *     summary: Get passenger list for a flight
 *     tags: [Flights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: flightNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Flight number
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Flight date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of passengers
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Flight not found
 */
router.get('/:flightNumber/passengers', authenticateToken, flightController.getPassengers);

module.exports = router;
