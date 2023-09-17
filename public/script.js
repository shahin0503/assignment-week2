const loginForm = document.getElementById('login-form')
const loginContainer = document.getElementById('login-container')
const itemForm = document.getElementById('item-form')
const itemNameInput = document.getElementById('item-name')
const itemTable = document
	.getElementById('item-table')
	.getElementsByTagName('tbody')[0]
const messageDiv = document.getElementById('message')
const loginText = document.getElementById('login-text')
const signupText = document.getElementById('signup-text')
const formTitle = document.getElementById('form-title')
const logout = document.getElementById('logout-text')
// Show the login form by default
let isLogin = true
const toggleForm = () => {
	if (isLogin) {
		isLogin = false
		loginText.classList.add('hidden')
		formTitle.innerHTML = 'Sign up'
		signupText.classList.remove('hidden')
	} else {
		isLogin = true
		signupText.classList.add('hidden')
		formTitle.innerHTML = 'Log in'
		loginText.classList.remove('hidden')
	}
}

loginText.addEventListener('click', toggleForm)
signupText.addEventListener('click', toggleForm)

const checkLogin = () => {
    const token = localStorage.getItem('token')
    if (token) {
        fetch(`/api/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
        }).then(response => {
            if (response.status === 200) {
                // toke is valid, hide the login container
                loginContainer.classList.add('hidden')
				showMessage('You are already logged in', 'success')
            } else {
                loginContainer.classList.remove('hidden')
            }
        })
    }
}
loginForm.addEventListener('submit', e => {
	e.preventDefault()

	// Get the entered username and password
	const username = document.getElementById('username').value
	const password = document.getElementById('password').value

	let apiUri = ''
	if(isLogin) {
		apiUri = '/api/login'
	}else {
		apiUri = '/api/signup'
	}
	// Send a POST request to the login/signup endpoint
	fetch(apiUri, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ username, password })
	})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				// Store the token in localStorage
				localStorage.setItem('token', data.token)
				// hide login container if login is successful
				loginContainer.classList.add('hidden')
				showMessage('Login successful', 'success')
			} else {
				showMessage('Login failed. Please check your credentials.', 'error')
			}
		})
		.catch(error => {
			showMessage('An error occurred while logging in.', 'error')
		})
})

// Function to fetch and display items
const fetchItems = () => {
	fetch('/api/items')
		.then(response => response.json())
		.then(items => {
			itemTable.innerHTML = ''
			items.forEach(item => {
				const row = itemTable.insertRow()
				row.innerHTML = `
          <td>${item.id}</td>
          <td>${item.name}</td>
          <td>
            <button onclick="editItem(${item.id})">Edit</button>
            <button onclick="deleteItem(${item.id})">Delete</button>
          </td>
        `
			})
		})
}

// Function to add a new item
itemForm.addEventListener('submit', e => {
	e.preventDefault()
	const newItem = { name: itemNameInput.value }
	fetch('/api/items', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(newItem)
	}).then(response => {
		if (response.status === 201) {
			itemNameInput.value = ''
			fetchItems()
			showMessage('Item added successfully!', 'success')
		} else {
			showMessage('Failed to add item.', 'error')
		}
	})
})

// Function to delete an item
const deleteItem = id => {
    const token = localStorage.getItem('token')
    if (token) {

    }
	fetch(`/api/items/${id}`, {
		method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
	}).then(response => {
		if (response.status === 204) {
			fetchItems()
			showMessage('Item deleted successfully!', 'success')
		} else if (response.status === 401) {
			showMessage('You need to login to delete this item', 'error')
        } else{
			showMessage('Failed to delete item.', 'error')
		}
	})
}

// Function to edit an item
const editItem = id => {
	const newName = prompt('Enter the new name:')
	if (newName !== null) {
		const updatedItem = { name: newName }
		fetch(`/api/items/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(updatedItem)
		}).then(response => {
			if (response.status === 200) {
				fetchItems()
				showMessage('Item updated successfully!', 'success')
			} else {
				showMessage('Failed to update item.', 'error')
			}
		})
	}
}

// Logout the user by clearing the token from local storage
logout.addEventListener('click', () => {
	localStorage.removeItem('token')
	window.location.reload()
})
// Function to show a message
const showMessage = (message, type) => {
	messageDiv.textContent = message
	messageDiv.classList.remove('hidden')
	messageDiv.classList.add(type)
	setTimeout(() => {
		messageDiv.classList.add('hidden')
		messageDiv.classList.remove(type)
	}, 3000)
}

// Initial fetch of items
fetchItems()

// Check if user is already authenticated
checkLogin()