const authService = require('../services/authService');

async function register(req, res) {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    const result = await authService.register(username, password, role);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    const result = await authService.login(username, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
}

module.exports = { register, login };
