document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    const taskForm = document.getElementById('taskForm');

    auth.onAuthStateChanged(user => {
        if (user) {
            renderTasks();
            renderProfile();
        } else {
            window.location.href = 'index.html';
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.href = 'index.html';
            });
        });
    }

 if (taskForm) {
    const submitBtn = taskForm.querySelector('.submit-btn');
    submitBtn.onclick = handleTaskSubmit;
}
});

function handleTaskSubmit(e) {
    e.preventDefault();
    if (currentEditTaskId) {
        updateTask();
    } else {
        addTask();
    }
}

function getTasks(callback) {
    const user = auth.currentUser;
    if (user) {
        db.ref('tasks/' + user.uid).on('value', (snapshot) => {
            const tasks = [];
            snapshot.forEach(childSnapshot => {
                tasks.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            callback(tasks);
        });
    }
}

function renderTasks() {
    getTasks(tasks => {
        const today = new Date().toISOString().split("T")[0];
        const inboxContainer = document.getElementById("inboxTasks");
        const todayContainer = document.getElementById("todayTasks");
        const upcomingContainer = document.getElementById("upcomingTasks");
        const completedContainer = document.getElementById("completedTasks");

        if (inboxContainer) inboxContainer.innerHTML = '';
        if (todayContainer) todayContainer.innerHTML = '';
        if (upcomingContainer) upcomingContainer.innerHTML = '';
        if (completedContainer) completedContainer.innerHTML = '';

        // ✅ Sort by date and time
        tasks.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));

        const inboxByDate = {};
        const upcomingByDate = {};
        const completedByDate = {};

       tasks.forEach(task => {
    // Group Inbox (Pending tasks)
    if (!task.completed) {
        if (!inboxByDate[task.date]) inboxByDate[task.date] = [];
        inboxByDate[task.date].push(createTaskCard(task));

        if (task.date === today && todayContainer) {
            todayContainer.appendChild(createTaskCard(task));
        }

        if (task.date > today) {
            if (!upcomingByDate[task.date]) upcomingByDate[task.date] = [];
            upcomingByDate[task.date].push(createTaskCard(task));
        }
    } else {
        // Group Completed
        if (!completedByDate[task.date]) completedByDate[task.date] = [];
        completedByDate[task.date].push(createTaskCard(task));
    }
});


        // ✅ Render Inbox with date headings
        if (inboxContainer) {
            Object.keys(inboxByDate).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
                const heading = createDateHeading(date);
                inboxContainer.appendChild(heading);
                inboxByDate[date].forEach(card => inboxContainer.appendChild(card));
            });
        }

        // ✅ Render Upcoming with date headings
        if (upcomingContainer) {
            Object.keys(upcomingByDate).sort((a, b) => new Date(a) - new Date(b)).forEach(date => {
                const heading = createDateHeading(date);
                upcomingContainer.appendChild(heading);
                upcomingByDate[date].forEach(card => upcomingContainer.appendChild(card));
            });
        }

        // ✅ Render Completed with date headings
        if (completedContainer) {
            Object.keys(completedByDate).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
                const heading = createDateHeading(date);
                completedContainer.appendChild(heading);
                completedByDate[date].forEach(card => completedContainer.appendChild(card));
            });
        }
    });
}

// 🛠️ Helper: Create formatted date heading
function createDateHeading(date) {
    const heading = document.createElement('h3');
    heading.textContent = formatDateToDisplay(date); // "26 July 2025"
    heading.style.marginTop = '25px';
    heading.style.marginBottom = '10px';
    heading.style.color = '#333';
    return heading;
}

// 🛠️ Helper: Format date like "26 July 2025"
function formatDateToDisplay(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
}



function formatDateToDisplay(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}


function createTaskCard(task, options = {}) {
    const card = document.createElement('div');
    card.className = 'task-card';

    const today = new Date().toISOString().split("T")[0];

    let statusHTML = '';
    if (options.forceStatusLabel) {
        statusHTML = task.completed
            ? `<span class="completed-label">✔ Done</span>`
            : `<span class="pending-flag">⏳ Pending</span>`;
    } else if (task.deadline && task.deadline < today && !task.completed) {
        statusHTML = `<span class="pending-flag">⏳ Deadline Passed</span>`;
    }

    card.innerHTML = `
        <b>${task.title}</b><br>
        <small>${task.date} ${task.time}</small><br>
        ${task.description}<br>
        <small>Deadline: ${task.deadline || "N/A"}</small><br>
        <small>Category: ${task.category || "None"}</small><br>
        <div class="task-actions">
            ${!task.completed ? `<button onclick="completeTask('${task.id}')" class="btn-complete">✔ Complete</button>` : ''}
            <button onclick="editTask('${task.id}')" class="btn-edit">✎ Edit</button>
            <button onclick="deleteTask('${task.id}')" class="btn-delete">🗑 Delete</button>
        </div>
        ${statusHTML ? `<div class="task-status" style="margin-top: 10px; text-align: right;">${statusHTML}</div>` : ''}
    `;
    return card;
}

function completeTask(taskId) {
  const user = auth.currentUser;
  if (user) {
    if (confirm("Mark this task as completed?")) {
      db.ref('tasks/' + user.uid + '/' + taskId).update({
        completed: true
      })
      .then(() => {
        // No need to call renderTasks() here as getTasks uses .on('value')
        // which automatically re-renders when data changes.
        console.log("Task marked as complete in Firebase.");
      })
      .catch(error => {
        alert("Error marking task as complete: " + error.message);
      });
    }
  }
}


function addTask() {
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to add tasks.");
        return;
    }

    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const date = document.getElementById("taskDate").value;
    const time = document.getElementById("taskTime").value;
    const deadline = document.getElementById("taskDeadline").value;
    const category = document.getElementById("taskCategory").value;

    if (!title || !date || !time || !category) {
        alert("Please fill in all required fields: Title, Date, Time, and Category.");
        return;
    }

    db.ref('tasks/' + user.uid).push({
        title,
        description,
        date,
        time,
        deadline,
        category,
        completed: false
    }).then(() => {
        alert("Task added successfully!");
        document.getElementById("taskForm").reset();
        renderTasks(); // Re-render tasks to update all lists
        showTab('inbox'); // Optionally switch to inbox after adding
    }).catch(error => {
        alert("Error adding task: " + error.message);
    });
}

function toggleTaskStatus(taskId, completed) {
    const user = auth.currentUser;
    if (user) {
        db.ref('tasks/' + user.uid + '/' + taskId).update({
            completed: completed
        }).then(() => {
            renderTasks();
        }).catch(error => {
            alert("Error updating task status: " + error.message);
        });
    }
}

function deleteTask(taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
        const user = auth.currentUser;
        if (user) {
            db.ref('tasks/' + user.uid + '/' + taskId).remove()
                .then(() => {
                    renderTasks();
                })
                .catch(error => {
                    alert("Error deleting task: " + error.message);
                });
        }
    }
}

let currentEditTaskId = null;

function editTask(taskId) {
    const user = auth.currentUser;
    if (!user) return;

    db.ref('tasks/' + user.uid + '/' + taskId).once('value', snapshot => {
        const task = snapshot.val();
        if (task) {
            currentEditTaskId = taskId;
            document.getElementById("taskTitle").value = task.title;
            document.getElementById("taskDescription").value = task.description;
            document.getElementById("taskDate").value = task.date;
            document.getElementById("taskTime").value = task.time;
            document.getElementById("taskDeadline").value = task.deadline;
            document.getElementById("taskCategory").value = task.category;

            // Change form to update mode
            const taskForm = document.getElementById('taskForm');
            const submitBtn = taskForm.querySelector('.submit-btn');
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Task';
            submitBtn.onclick = updateTask; // Set the click handler to updateTask
            showTab('addTask'); // Switch to Add a Task tab for editing
        }
    });
}

function updateTask() {
    const user = auth.currentUser;
    if (!user || !currentEditTaskId) return;

    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const date = document.getElementById("taskDate").value;
    const time = document.getElementById("taskTime").value;
    const deadline = document.getElementById("taskDeadline").value;
    const category = document.getElementById("taskCategory").value;

    if (!title || !date || !time || !category) {
        alert("Please fill in all required fields: Title, Date, Time, and Category.");
        return;
    }

    db.ref('tasks/' + user.uid + '/' + currentEditTaskId).update({
        title,
        description,
        date,
        time,
        deadline,
        category
    }).then(() => {
        alert("Task updated successfully!");
        document.getElementById("taskForm").reset();
        const submitBtn = document.getElementById('taskForm').querySelector('.submit-btn');
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Add Task';
        submitBtn.onclick = addTask; // Reset click handler to addTask
        currentEditTaskId = null;
        renderTasks();
        showTab('inbox'); // Optionally switch to inbox after updating
    }).catch(error => {
        alert("Error updating task: " + error.message);
    });
}


function renderProfile() {
    const user = auth.currentUser;
    if (user) {
        db.ref('users/' + user.uid).once('value', snapshot => {
            const userData = snapshot.val();
            const profileInfoDiv = document.getElementById('profileInfo');
            if (profileInfoDiv && userData) {
                profileInfoDiv.innerHTML = `
                    <p><strong>Full Name:</strong> ${userData.fullName}</p>
                    <p><strong>Email:</strong> ${userData.email}</p>
                    `;
            }
        });
    }
}

function editProfile() {
    const user = auth.currentUser;
    if (user) {
        db.ref('users/' + user.uid).once('value', snapshot => {
            const userData = snapshot.val();
            if (userData) {
                const newName = prompt("Enter new full name:", userData.fullName);
                const newEmail = prompt("Enter new email:", userData.email);

                if (newName !== null && newEmail !== null) { // User didn't cancel
                    db.ref('users/' + user.uid).update({
                        fullName: newName,
                        email: newEmail
                    }).then(() => {
                        alert("Profile updated successfully!");
                        // You might need to re-authenticate the user if the email changes for some Firebase functionalities.
                        // For display, simply re-render.
                        renderProfile();
                    }).catch(error => {
                        alert("Error updating profile: " + error.message);
                    });
                }
            }
        });
    }
}

function deleteAccount() {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
        const user = auth.currentUser;
        if (user) {
            // First, delete user data from the database
            db.ref('users/' + user.uid).remove()
                .then(() => {
                    return db.ref('tasks/' + user.uid).remove(); // Also delete their tasks
                })
                .then(() => {
                    // Then, delete the user from Firebase Authentication
                    return user.delete();
                })
                .then(() => {
                    alert("Account deleted successfully.");
                    window.location.href = 'index.html'; // Redirect to login page
                })
                .catch(error => {
                    alert("Error deleting account: " + error.message);
                    // Handle errors, e.g., re-authenticate user if needed
                    // if (error.code === 'auth/requires-recent-login') {
                    //     alert('Please log in again to delete your account.');
                    //     // Redirect to login or prompt for re-authentication
                    // }
                });
        }
    }
}


function filterTasks() {
    getTasks(tasks => {
        const titleFilter = document.getElementById('filterTitle').value.toLowerCase();
        const dateFilter = document.getElementById('filterDate').value;
        const categoryFilter = document.getElementById('filterCategory').value;
        const statusFilter = document.querySelector('input[name="filterStatus"]:checked').value;

        const filteredTasksContainer = document.getElementById('filteredTasks');
        filteredTasksContainer.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            const titleMatch = task.title.toLowerCase().includes(titleFilter);
            const dateMatch = !dateFilter || task.date === dateFilter;
            const categoryMatch = !categoryFilter || task.category === categoryFilter;
            const statusMatch =
                statusFilter === 'all' ||
                (statusFilter === 'completed' && task.completed) ||
                (statusFilter === 'pending' && !task.completed);

            return titleMatch && dateMatch && categoryMatch && statusMatch;
        });

        if (filteredTasks.length === 0) {
            filteredTasksContainer.innerHTML = '<p style="text-align: center; margin-top: 20px; color: #777;">No tasks found matching your criteria.</p>';
        } else {
            filteredTasks.forEach(task => {
                filteredTasksContainer.appendChild(createTaskCard(task, { forceStatusLabel: true }));
            });
        }
    });
}

function clearFilters() {
  document.getElementById("filterTitle").value = "";
  document.getElementById("filterDate").value = "";
  document.getElementById("filterCategory").value = "";
  document.querySelector('input[name="filterStatus"][value="all"]').checked = true;
  filterTasks(); // Re-apply filters to show all tasks
}