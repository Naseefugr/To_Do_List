// ✔ Redirect to dashboard if logged in and currently on index.html
if (getCurrentUser() && location.pathname.includes("index.html")) {
  location.href = "dashboard.html";
}

// ✔ Redirect to index.html if not logged in and tries to access dashboard.html
if (!getCurrentUser() && location.pathname.includes("dashboard.html")) {
  location.href = "index.html";
}

// ✔ Utility: User management
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "{}");
}
function setUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}
function getCurrentUser() {
  return localStorage.getItem("currentUser");
}
function setCurrentUser(username) {
  localStorage.setItem("currentUser", username);
}
function logout() {
  localStorage.removeItem("currentUser");
  location.href = "index.html";
}
function toggleForms() {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  if (!loginForm || !signupForm) return;
  loginForm.style.display = loginForm.style.display === "none" ? "block" : "none";
  signupForm.style.display = signupForm.style.display === "none" ? "block" : "none";
}

// ✔ DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname;


// ✔ Then the rest of your DOMContentLoaded logic
document.addEventListener("DOMContentLoaded", () => {
  // login form, signup form, etc...
});
  // Login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const users = getUsers();
      const username = document.getElementById("loginUsername").value;
      const password = document.getElementById("loginPassword").value;
      if (users[username] && users[username].password === password) {
        setCurrentUser(username);
        location.href = "dashboard.html";
      } else {
        alert("Invalid credentials");
      }
    });
  }

  // Signup form
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const fullName = document.getElementById("signupFullName").value;
      const email = document.getElementById("signupEmail").value;
      const username = document.getElementById("signupUsername").value;
      const password = document.getElementById("signupPassword").value;
      const code = document.getElementById("signupCode").value;

      const users = getUsers();
      if (users[username]) return alert("Username already exists");

      users[username] = { fullName, email, password, code };
      setUsers(users);
      alert("Signup successful. Please log in.");
      toggleForms();
    });
  }

  // Dashboard init
  if (path.includes("dashboard.html")) {
    renderTasks();
    const taskForm = document.getElementById("taskForm");
    if (taskForm) {
      taskForm.addEventListener("submit", function (e) {
        e.preventDefault();
        addTask();
      });
    }
  }
});

// ✔ Task-related functions remain unchanged below...

// (KEEP YOUR EXISTING renderTasks, addTask, completeTask, deleteTask, editTask, etc...)


if (getCurrentUser() && location.pathname.includes("index.html")) {
  location.href = "dashboard.html";
}

function showTab(tabId) {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => (tab.style.display = "none"));
  const activeTab = document.getElementById(tabId);
  if (activeTab) activeTab.style.display = "block";
}
function toggleProfileMenu() {
  const dropdown = document.getElementById("profileDropdown");
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

function getTasks() {
  const username = getCurrentUser();
  return JSON.parse(localStorage.getItem("tasks_" + username) || "[]");
}
function saveTasks(tasks) {
  const username = getCurrentUser();
  localStorage.setItem("tasks_" + username, JSON.stringify(tasks));
}
function groupTasksByDate(tasks) {
  return tasks.reduce((acc, task) => {
    if (!acc[task.date]) acc[task.date] = [];
    acc[task.date].push(task);
    return acc;
  }, {});
}

function renderGroupedTasks(container, groupedTasks, showCompleted = false) {
  container.innerHTML = "";
  const sortedDates = Object.keys(groupedTasks).sort().reverse();

  sortedDates.forEach((date) => {
    const dateGroup = document.createElement("div");
    dateGroup.className = "task-date-group";

    const dateHeading = document.createElement("h4");
    dateHeading.textContent = `📅 ${date}`;
    dateGroup.appendChild(dateHeading);

    groupedTasks[date].forEach((task) => {
      const taskCard = document.createElement("div");
      taskCard.className = "task-card";

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const deadlineDate = new Date(task.deadline);
      deadlineDate.setHours(0, 0, 0, 0);

      const isOverduePending = !task.completed && task.deadline && deadlineDate < today;

taskCard.innerHTML = `
  <b>${task.title}</b><br>
  <small>${task.date} ${task.time}</small><br>
  ${task.description}<br>
  <small>Deadline: ${task.deadline || "N/A"}</small><br>
  <small>Category: ${task.criteria || "None"}</small><br>
  ${isOverduePending ? `<span class="pending-flag">⚠ Pending (Deadline Missed)</span><br>` : ""}
  <div class="task-actions">
    ${!task.completed ? `<button onclick="confirmComplete(${task.id})">✔ Complete</button>` : ""}
    <button onclick="editTask(${task.id})">✎ Edit</button>
    <button onclick="deleteTask(${task.id})">🗑 Delete</button>
  </div>
`;
      dateGroup.appendChild(taskCard);
    });
    container.appendChild(dateGroup);
  });
}

function renderTasks() {
  const tasks = getTasks();
  const today = new Date().toISOString().split("T")[0];
  const now = new Date(today);

  const inboxContainer = document.getElementById("inboxTasks");
  const todayContainer = document.getElementById("todayTasks");
  const upcomingContainer = document.getElementById("upcomingTasks");
  const completedContainer = document.getElementById("completedTasks");

  const inbox = [];
  const todayList = [];
  const upcoming = [];
  const completed = [];

  tasks.forEach((task, i) => {
    task.id = i;

    const taskDate = new Date(task.date);
    const deadlineDate = task.deadline ? new Date(task.deadline) : null;

    if (task.completed) {
      completed.push(task);
    } else {
      // Inbox includes all tasks
      inbox.push(task);

      // Add to Today if the main date is today
      if (task.date === today) {
        todayList.push(task);
      }

      // Add to Today if deadline is today (optional logic — can be removed)
      if (task.deadline === today && !todayList.includes(task)) {
        todayList.push(task);
      }

      // Add to Upcoming if taskDate > today
      if (taskDate > now) {
        upcoming.push(task);
      }

      // Add to Upcoming if deadline is in future
      if (deadlineDate && deadlineDate > now) {
        upcoming.push(task);
      }
    }
  });

  // Avoid duplicates (optional cleanup)
  const uniqueToday = Array.from(new Set(todayList));
  const uniqueUpcoming = Array.from(new Set(upcoming));

  renderGroupedTasks(inboxContainer, groupTasksByDate(inbox.filter(t => !t.completed).reverse()));
  renderGroupedTasks(todayContainer, groupTasksByDate(uniqueToday.filter(t => !t.completed)));
  renderGroupedTasks(upcomingContainer, groupTasksByDate(uniqueUpcoming.filter(t => !t.completed)));
  renderGroupedTasks(completedContainer, groupTasksByDate(completed), true);
}
function addTask() {
  const title = document.getElementById("taskTitle").value;
  const description = document.getElementById("taskDescription").value;
  const date = document.getElementById("taskDate").value;
  const time = document.getElementById("taskTime").value;
  const deadline = document.getElementById("taskDeadline").value;
  const criteria = document.getElementById("taskCategory").value;

  if (!title || !date || !time) {
    alert("All Set!");
    return;
  }

  const tasks = getTasks();
  tasks.push({ title, description, date, time, deadline, criteria, completed: false });
  saveTasks(tasks);
  alert("Task added!");
  document.getElementById("taskForm").reset();
  renderTasks();
}

function confirmComplete(index) {
  const check1 = confirm("Mark task as complete?");
  if (!check1) return;
  const check2 = confirm("Are you absolutely sure?");
  if (!check2) return;
  completeTask(index);
}

function completeTask(index) {
  const tasks = getTasks();
  tasks[index].completed = true;
  saveTasks(tasks);
  renderTasks();
}

function deleteTask(index) {
  if (!confirm("Delete this task permanently?")) return;
  const tasks = getTasks();
  tasks.splice(index, 1);
  saveTasks(tasks);
  renderTasks();
}

function editTask(index) {
  const tasks = getTasks();
  const task = tasks[index];

  const title = prompt("Edit Title:", task.title);
  const desc = prompt("Edit Description:", task.description);
  const date = prompt("Edit Date:", task.date);
  const time = prompt("Edit Time:", task.time);
  const deadline = prompt("Edit Deadline:", task.deadline);
  const criteria = prompt("Edit Category:", task.criteria);

  if (title !== null) task.title = title;
  if (desc !== null) task.description = desc;
  if (date !== null) task.date = date;
  if (time !== null) task.time = time;
  if (deadline !== null) task.deadline = deadline;
  if (criteria !== null) task.criteria = criteria;

  saveTasks(tasks);
  renderTasks();
}

function filterTasks() {
  const titleInput = document.getElementById("filterTitle").value.toLowerCase();
  const dateInput = document.getElementById("filterDate").value;
  const categoryInput = document.getElementById("filterCategory").value;
  const statusInputEl = document.querySelector('input[name="filterStatus"]:checked');
  const statusInput = statusInputEl ? statusInputEl.value : "all";

  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const tasks = JSON.parse(localStorage.getItem("tasks_" + currentUser) || "[]");

  const filteredTasks = tasks.filter(task => {
    const matchesTitle = !titleInput || task.title.toLowerCase().includes(titleInput);
    const matchesDate = !dateInput || task.date === dateInput;
    const matchesCategory = !categoryInput || task.criteria === categoryInput;
    const isCompleted = task.completed;

    const matchesStatus =
      statusInput === "all" ||
      (statusInput === "completed" && isCompleted) ||
      (statusInput === "pending" && !isCompleted);

    return matchesTitle && matchesDate && matchesCategory && matchesStatus;
  });

  displayFilteredTasks(filteredTasks);
}

function displayFilteredTasks(tasks) {
  const container = document.getElementById("filteredTasks");
  container.innerHTML = "";

  if (tasks.length === 0) {
    container.innerHTML = "<p style='text-align:center; color: #777;'>No tasks found.</p>";
    return;
  }

  tasks.forEach((task, index) => {
    const card = document.createElement("div");
    card.className = "task-card";
    card.style.cssText = `
      background: #fff;
      border-left: 5px solid ${task.completed ? "#4caf50" : "#2196f3"};
      border-radius: 10px;
      padding: 15px 20px;
      margin-bottom: 15px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.07);
      transition: all 0.3s;
    `;

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 1.1em; color: #333;">
          ${task.title}
          <span style="font-size: 0.85em; color: #777; font-weight: normal;">– ${task.date} ${task.time}</span>
        </h3>
        ${task.completed
          ? '<span style="color: green; font-weight: bold;"><i class="fas fa-check-circle"></i> Done</span>'
          : '<span style="color: #f39c12;"><i class="fas fa-hourglass-half"></i> Pending</span>'}
      </div>

      <p style="margin: 8px 0; color: #444;">
        ${task.description || "<i>No description</i>"}
      </p>

      <div style="font-size: 0.9em; color: #555;">
        <p style="margin: 4px 0;"><i class="fas fa-calendar-check"></i> <strong>Deadline:</strong> ${task.deadline || "None"}</p>
        <p style="margin: 4px 0;"><i class="fas fa-folder-open"></i> <strong>Category:</strong> ${task.criteria || "Uncategorized"}</p>
      </div>
    `;

    container.appendChild(card);
  });
}


function formatDisplayDate(dateStr) {
  const options = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
  return new Date(dateStr).toLocaleDateString(undefined, options);
}



function editProfile() {
  const users = getUsers();
  const username = getCurrentUser();
  const user = users[username];
  if (!user) return;

  const fullName = prompt("Edit Full Name:", user.fullName);
  const email = prompt("Edit Email:", user.email);
  const password = prompt("Edit Password:", user.password);

  if (fullName !== null) user.fullName = fullName;
  if (email !== null) user.email = email;
  if (password !== null) user.password = password;

  users[username] = user;
  setUsers(users);
  alert("Profile updated!");
  renderProfile();
}

function deleteAccount() {
  const confirm1 = confirm("Are you sure you want to delete your account?");
  const confirm2 = confirm("This action is permanent. Continue?");
  if (!confirm1 || !confirm2) return;

  const username = getCurrentUser();
  const users = getUsers();
  delete users[username];
  setUsers(users);

  // Also remove tasks
  localStorage.removeItem("tasks_" + username);

  logout();
  alert("Account deleted successfully.");
}

// ✔ MODIFY showTab to re-render profile on view
function showTab(tabId) {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => (tab.style.display = "none"));
  const activeTab = document.getElementById(tabId);
  if (activeTab) activeTab.style.display = "block";
  if (tabId === "profile") renderProfile();
}

/* ✔ NEW: ADMIN PAGE SCRIPT (admin.html must include this script) */
function renderAdminUsers() {
  const users = getUsers();
  const container = document.getElementById("adminUserList");
  if (!container) return;

  container.innerHTML = "<h2>📊 All Users</h2>";
  Object.entries(users).forEach(([username, user]) => {
    const userBox = document.createElement("div");
    userBox.style.border = "1px solid #ccc";
    userBox.style.margin = "10px 0";
    userBox.style.padding = "10px";
    userBox.innerHTML = `
      <p><strong>Full Name:</strong> ${user.fullName}</p>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Password:</strong> ${user.password}</p>
      <p><strong>Entry Code:</strong> ${user.code}</p>
      <button onclick="adminEditUser('${username}')">Edit</button>
      <button onclick="adminDeleteUser('${username}')" style="background:red;color:white;">Delete</button>
    `;
    container.appendChild(userBox);
  });
}

function adminEditUser(username) {
  const users = getUsers();
  const user = users[username];
  if (!user) return;

  const fullName = prompt("Edit Full Name:", user.fullName);
  const email = prompt("Edit Email:", user.email);
  const password = prompt("Edit Password:", user.password);

  if (fullName !== null) user.fullName = fullName;
  if (email !== null) user.email = email;
  if (password !== null) user.password = password;

  users[username] = user;
  setUsers(users);
  alert("User updated successfully.");
  renderAdminUsers();
}

function adminDeleteUser(username) {
  const confirm1 = confirm("Delete user '" + username + "'?");
  const confirm2 = confirm("This action is permanent. Continue?");
  if (!confirm1 || !confirm2) return;

  const users = getUsers();
  delete users[username];
  setUsers(users);
  localStorage.removeItem("tasks_" + username);
  alert("User deleted.");
  renderAdminUsers();
}

function loadProfile() {
  const currentUser = getCurrentUser();
  const users = getUsers();
  const userData = users[currentUser];

  if (userData) {
    document.getElementById("viewName").textContent = userData.fullName;
    document.getElementById("viewEmail").textContent = userData.email;
    document.getElementById("viewUsername").textContent = currentUser;

    document.getElementById("editName").value = userData.fullName;
    document.getElementById("editEmail").value = userData.email;
    document.getElementById("editUsername").value = currentUser;
  }
}

function toggleEditProfile(isEditing) {
  document.getElementById("profileView").style.display = isEditing ? "none" : "block";
  document.getElementById("profileEdit").style.display = isEditing ? "block" : "none";
}

function saveProfileChanges() {
  const newName = document.getElementById("editName").value.trim();
  const newEmail = document.getElementById("editEmail").value.trim();
  const newUsername = document.getElementById("editUsername").value.trim();

  const users = getUsers();
  const oldUsername = getCurrentUser();
  const userData = users[oldUsername];

  if (newUsername !== oldUsername && users[newUsername]) {
    alert("Username already exists. Choose a different one.");
    return;
  }

  // Remove old entry if username changed
  if (newUsername !== oldUsername) {
    delete users[oldUsername];
  }

  users[newUsername] = {
    fullName: newName,
    email: newEmail,
    password: userData.password,
    entryCode: userData.entryCode,
  };

  setUsers(users);
  setCurrentUser(newUsername);
  toggleEditProfile(false);
  loadProfile();
  alert("Profile updated successfully.");
}

