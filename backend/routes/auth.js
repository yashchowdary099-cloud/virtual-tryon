// FILE: backend/routes/auth.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const usersFilePath = path.join(__dirname, '../data/users.json');

// Helper to read users from data/users.json
function getUsers() {
  try {
    if (!fs.existsSync(usersFilePath)) {
      fs.writeFileSync(usersFilePath, '[]', 'utf8');
      return [];
    }
    const content = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error('[Auth Error] Failed to read users file:', err);
    return [];
  }
}

// Helper to save users to data/users.json
function saveUsers(users) {
  try {
    const dir = path.dirname(usersFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: recursive });
    }
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('[Auth Error] Failed to save users file:', err);
  }
}

/**
 * GET /api/auth
 * Status check
 */
router.get('/', (req, res) => {
  res.json({
    status: 'active',
    message: 'TrueFit Express Backend Auth API'
  });
});

/**
 * POST /api/auth/login
 * Local / Fallback Login Endpoint
 */
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter both email and password.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = getUsers();

    let user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      // Auto-create user for local fallback mode if not present
      const nameFromEmail = cleanEmail.split('@')[0];
      user = {
        id: `usr_${Date.now()}`,
        email: cleanEmail,
        name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      users.push(user);
    } else {
      user.lastLoginAt = new Date().toISOString();
    }

    saveUsers(users);

    const token = `tf_token_${Buffer.from(user.email).toString('base64')}_${Date.now()}`;

    return res.json({
      success: true,
      message: 'Log in successful!',
      token,
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          name: user.name
        }
      }
    });

  } catch (err) {
    console.error('[Auth API Exception - login]:', err);
    return res.status(500).json({
      success: false,
      error: 'Server authentication failure. Please try again.'
    });
  }
});

/**
 * POST /api/auth/signup
 * Local / Fallback Sign Up Endpoint
 */
router.post('/signup', (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email address and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = getUsers();

    let existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (existingUser) {
      existingUser.lastLoginAt = new Date().toISOString();
      saveUsers(users);
      const token = `tf_token_${Buffer.from(existingUser.email).toString('base64')}_${Date.now()}`;
      return res.json({
        success: true,
        message: 'Account already exists. Logged in successfully!',
        token,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          user_metadata: {
            name: existingUser.name
          }
        }
      });
    }

    const nameFromEmail = name || cleanEmail.split('@')[0];
    const newUser = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    const token = `tf_token_${Buffer.from(newUser.email).toString('base64')}_${Date.now()}`;

    return res.json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        user_metadata: {
          name: newUser.name
        }
      }
    });

  } catch (err) {
    console.error('[Auth API Exception - signup]:', err);
    return res.status(500).json({
      success: false,
      error: 'Server sign up failure. Please try again.'
    });
  }
});

module.exports = router;
