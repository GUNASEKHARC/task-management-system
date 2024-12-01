let editingTaskId = null;
let tasks = [];  // Store tasks locally
let sortState = { column: 'id', ascending: true };  // Track sorting column and order
let filteredTasks = []; // Track filtered tasks (for filtering and search)

async function handleFormSubmit(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const due_date = document.getElementById('due_date').value;
    const status = document.getElementById('status').value;

    const taskData = { title, description, due_date, status };

    // Basic validation
    if (!title) {
        alert("Title is required!");
        return;
    }

    if (editingTaskId) {
        await updateTask(editingTaskId, taskData);
    } else {
        await createTask(taskData);
    }

    document.getElementById('task-form').reset();
    editingTaskId = null;
    loadTasks(); // Reload tasks after submission
}

async function createTask(taskData) {
    try {
        const response = await fetch('http://127.0.0.1:5000/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        const result = await response.json();
        if (response.ok) alert(result.message);
    } catch (error) {
        console.error('Error creating task:', error);
    }
}

async function updateTask(taskId, taskData) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        const result = await response.json();
        if (response.ok) alert(result.message);
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

function populateEditForm(task) {
    document.getElementById('title').value = task.title || '';
    document.getElementById('description').value = task.description || '';
    document.getElementById('due_date').value = task.due_date || '';
    document.getElementById('status').value = task.status || '';
    editingTaskId = task.id;  // Set the task ID for editing
}

async function loadTasks() {
    try {
        const response = await fetch('http://127.0.0.1:5000/tasks');
        tasks = await response.json();
        filteredTasks = [...tasks]; // Update filteredTasks with the full list initially
        sortTasks(sortState.column); // Sort tasks after loading
        displayTasks(); // Display sorted tasks
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

function displayTasks(tasksToDisplay = filteredTasks) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';  // Clear the list

    tasksToDisplay.forEach(task => {
        const taskElement = document.createElement('tr');
        taskElement.innerHTML = `
            <td>${task.id}</td>
            <td>${task.title}</td>
            <td>${task.description}</td>
            <td>${task.due_date}</td>
            <td>${task.status}</td>
            <td>
                <button onclick="populateEditForm(${JSON.stringify(task).replace(/"/g, '&quot;')})">Edit</button>
                <button onclick="deleteTask(${task.id})">Delete</button>
            </td>
        `;
        taskList.appendChild(taskElement);
    });
}

function sortTasks(column) {
    // Check if we're sorting by the same column, and toggle the sort order
    if (sortState.column === column) {
        sortState.ascending = !sortState.ascending;
    } else {
        sortState.column = column;
        sortState.ascending = true;  // Default to ascending when switching columns
    }

    // Sort the tasks array
    filteredTasks.sort((a, b) => {
        const valA = a[column];
        const valB = b[column];
        if (valA < valB) return sortState.ascending ? -1 : 1;
        if (valA > valB) return sortState.ascending ? 1 : -1;
        return 0;
    });

    displayTasks();  // Re-render tasks after sorting
}

function filterTasks(status) {
    if (status) {
        filteredTasks = tasks.filter(task => task.status === status);
    } else {
        filteredTasks = [...tasks];
    }
    displayTasks();
}

function searchTasks() {
    const query = document.getElementById('search-bar').value.toLowerCase();
    filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query)
    );
    displayTasks();
}

async function deleteTask(taskId) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/tasks/${taskId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (response.ok) alert(result.message);
        loadTasks(); // Reload tasks after deletion
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadTasks);
document.getElementById('task-form').addEventListener('submit', handleFormSubmit);
