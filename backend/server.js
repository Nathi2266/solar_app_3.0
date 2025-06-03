const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // For testing, accept any login
  res.json({
    token: 'test-token',
    user: {
      username,
      email: 'test@example.com'
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 