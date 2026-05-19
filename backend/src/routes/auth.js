// routes/auth.js
// Handles user signup and login via Supabase Auth.

const express = require('express');
const router = express.Router();
const { supabase } = require('../services/supabase.js');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) throw error;

    res.json({
      message: 'Signup successful',
      user: { id: data.user.id, email: data.user.email }
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    res.json({
      message: 'Login successful',
      user: { id: data.user.id, email: data.user.email },
      token: data.session.access_token
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;