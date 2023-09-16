// Import necessary modules
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const jwt = require('jsonwebtoken');

// Create an Express app
const app = express()

// Middleware
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('public'))

// Sample in-memory database
let data = []
let nextItemId = 1
const users = [
	{ id: 1, username: 'user1', password: 'password1' },
	{ id: 2, username: 'user2', password: 'password2' }
]

// Middleware for logging requests
app.use((req, res, next) => {
	console.log(`Received ${req.method} request for ${req.url}`)
	next()
})

// Middleware for handling errors
app.use((err, req, res, next) => {
	console.error(err)
	res.status(500).json({ error: 'Something went wrong!' })
})

function authenticateUser(req, res, next) {
    // Get the token from the request headers
    const token = req.headers.authorization.split(' ')[1];
  
    // Check if a token is provided
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
  
    console.log('Authentication token', token);
    // Verify the token using your secret key
    const secretKey = 'your-secret-key'; // Replace with your actual secret key
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
  
      // If the token is valid, you can access the decoded data
      req.user = decoded; // Store the user data in the request for further route handlers
      next(); // Continue to the protected route
    });
  }

app.get('/api/me', authenticateUser, (req, res) => {
    res.status(200).send();
})

app.post('/api/login', (req, res) => {
	const { username, password } = req.body
	const user = users.find(
		u => u.username === username && u.password === password
	)

	if (user) {
		// Create a JWT payload with user information (you can customize this)
		const payload = {
			id: user.id,
			username: user.username
		}

		// Sign the token with a secret key (keep this secret!)
		const secretKey = 'your-secret-key' // Replace with your actual secret key
		const options = {
			expiresIn: '1h' // Set the expiration time for the token
		}

		// Generate the JWT
		const token = jwt.sign(payload, secretKey, options)

		// Return the token to the client
		res.json({ success: true, message: 'Login successful', token })
	} else {
		res.status(401).json({ success: false, message: 'Authentication failed' })
	}
})

// CRUD API Routes
// GET all items
app.get('/api/items', (req, res) => {
	res.json(data)
})

// POST a new item
app.post('/api/items', (req, res) => {
	const newItem = {
		id: nextItemId++,
		name: req.body.name
	}
	data.push(newItem)
	res.status(201).json(newItem)
})

// PUT (update) an item by ID
app.put('/api/items/:id', (req, res) => {
	const itemId = parseInt(req.params.id)
	const updatedItem = req.body
	const index = data.findIndex(item => item.id === itemId)
	if (index !== -1) {
		data[index] = { ...data[index], ...updatedItem }
		res.json(data[index])
	} else {
		res.status(404).json({ error: 'Item not found' })
	}
})

// DELETE an item by ID
app.delete('/api/items/:id', authenticateUser, (req, res) => {
	const itemId = parseInt(req.params.id)
	data = data.filter(item => item.id !== itemId)
	res.sendStatus(204)
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
	console.log(`Server is running on port ${port}`)
})
