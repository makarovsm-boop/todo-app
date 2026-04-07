const authSection = document.getElementById("auth-section");
const todoSection = document.getElementById("todo-section");
const authForm = document.getElementById("auth-form");
const authUsernameInput = document.getElementById("auth-username-input");
const authPasswordInput = document.getElementById("auth-password-input");
const authSubmitButton = document.getElementById("auth-submit-btn");
const authHelperText = document.getElementById("auth-helper-text");
const authStatusMessage = document.getElementById("auth-status-message");
const authModeButtons = document.querySelectorAll(".auth-toggle-btn");
const currentUserLabel = document.getElementById("current-user");
const logoutButton = document.getElementById("logout-btn");

const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const categoryInput = document.getElementById("category-input");
const priorityInput = document.getElementById("priority-input");
const dueDateInput = document.getElementById("due-date-input");
const todoList = document.getElementById("todo-list");
const taskCount = document.getElementById("task-count");
const emptyMessage = document.getElementById("empty-message");
const statusMessage = document.getElementById("status-message");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedButton = document.getElementById("clear-completed-btn");

const taskApiBaseUrl = "/tasks";
const authApiBaseUrl = "/auth";

// The browser keeps a copy of the server data in this array while the page is open.
let tasks = [];
let currentFilter = "all";
let currentUser = null;
let authMode = "login";

setAuthMode("login");
checkSession();

authModeButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    setAuthMode(button.dataset.mode);
  });
});

authForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = authUsernameInput.value.trim();
  const password = authPasswordInput.value;

  if (username === "" || password === "") {
    showAuthStatus("Please enter both a username and password.");
    return;
  }

  try {
    const response = await fetch(authApiBaseUrl + "/" + authMode, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || "Authentication failed.");
    }

    currentUser = responseData.user;
    authForm.reset();
    showTodoSection();
    showTaskStatus(responseData.message);
    await loadTasks();
  } catch (error) {
    showAuthStatus(error.message);
  }
});

logoutButton.addEventListener("click", async function () {
  try {
    const response = await fetch(authApiBaseUrl + "/logout", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Could not log out.");
    }

    currentUser = null;
    tasks = [];
    todoForm.reset();
    renderTasks();
    showAuthSection("You have been logged out.");
  } catch (error) {
    showTaskStatus("The server could not log you out.");
  }
});

todoForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const taskText = todoInput.value.trim();
  const category = categoryInput.value.trim();
  const priority = priorityInput.value;
  const dueDate = dueDateInput.value;

  if (taskText === "") {
    showTaskStatus("Please enter a task before adding it.");
    return;
  }

  const newTask = {
    text: taskText,
    category: category === "" ? "General" : category,
    priority: priority,
    dueDate: dueDate,
  };

  try {
    const createdTask = await requestTaskJson(taskApiBaseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    });

    tasks.unshift(createdTask);
    renderTasks();

    todoForm.reset();
    priorityInput.value = "Medium";
    todoInput.focus();
    showTaskStatus("Task added.");
  } catch (error) {
    showTaskStatus(error.message || "The server could not save the task.");
  }
});

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;
    updateActiveFilterButton();
    renderTasks();
  });
});

clearCompletedButton.addEventListener("click", async function () {
  const completedTasks = tasks.filter(function (task) {
    return task.completed;
  });

  if (completedTasks.length === 0) {
    showTaskStatus("There are no completed tasks to clear.");
    return;
  }

  try {
    await Promise.all(
      completedTasks.map(function (task) {
        return requestTaskJson(taskApiBaseUrl + "/" + task.id, {
          method: "DELETE",
        });
      })
    );

    tasks = tasks.filter(function (task) {
      return !task.completed;
    });

    renderTasks();
    showTaskStatus("Completed tasks cleared.");
  } catch (error) {
    showTaskStatus(error.message || "The server could not clear completed tasks.");
  }
});

async function checkSession() {
  try {
    const response = await fetch(authApiBaseUrl + "/me");

    if (response.status === 401) {
      showAuthSection();
      return;
    }

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error("Could not check login status.");
    }

    currentUser = responseData.user;
    showTodoSection();
    await loadTasks();
  } catch (error) {
    showAuthSection("The app could not check your login status.");
  }
}

async function loadTasks() {
  if (!currentUser) {
    tasks = [];
    renderTasks();
    return;
  }

  try {
    // Ask the server for the current user's task list.
    tasks = await requestTaskJson(taskApiBaseUrl);
    renderTasks();
  } catch (error) {
    showTaskStatus(error.message || "The app could not load tasks from the server.");
  }
}

function renderTasks() {
  todoList.innerHTML = "";

  const filteredTasks = tasks.filter(function (task) {
    if (currentFilter === "active") {
      return !task.completed;
    }

    if (currentFilter === "completed") {
      return task.completed;
    }

    return true;
  });

  filteredTasks.forEach(function (task) {
    const listItem = document.createElement("li");
    listItem.className = "todo-item";

    if (task.completed) {
      listItem.classList.add("completed");
    }

    const mainRow = document.createElement("div");
    mainRow.className = "todo-main";

    const content = document.createElement("div");
    content.className = "todo-content";

    const taskText = document.createElement("p");
    taskText.className = "todo-text";
    taskText.textContent = task.text;

    const metaRow = document.createElement("div");
    metaRow.className = "todo-meta";

    const categoryBadge = document.createElement("span");
    categoryBadge.className = "meta-badge";
    categoryBadge.textContent = "Category: " + task.category;

    const priorityBadge = document.createElement("span");
    priorityBadge.className =
      "meta-badge priority-" + task.priority.toLowerCase();
    priorityBadge.textContent = "Priority: " + task.priority;

    metaRow.appendChild(categoryBadge);
    metaRow.appendChild(priorityBadge);

    const taskDate = document.createElement("p");
    taskDate.className = "todo-date";
    taskDate.textContent = "Created: " + formatDate(task.createdAt);

    content.appendChild(taskText);
    content.appendChild(metaRow);

    if (task.dueDate) {
      const dueDate = document.createElement("p");
      dueDate.className = "todo-due-date";
      dueDate.textContent = "Due: " + formatDueDate(task.dueDate);
      content.appendChild(dueDate);
    }

    content.appendChild(taskDate);

    const actions = document.createElement("div");
    actions.className = "todo-actions";

    const completeButton = document.createElement("button");
    completeButton.className = "complete-btn";
    completeButton.textContent = task.completed ? "Undo" : "Done";
    completeButton.addEventListener("click", async function () {
      await updateTask(task.id, {
        completed: !task.completed,
      });
    });

    const editButton = document.createElement("button");
    editButton.className = "edit-btn";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", async function () {
      await startEditingTask(task);
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", async function () {
      await deleteTask(task.id);
    });

    actions.appendChild(completeButton);
    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    mainRow.appendChild(content);
    mainRow.appendChild(actions);
    listItem.appendChild(mainRow);
    todoList.appendChild(listItem);
  });

  updateTaskCount();
  updateEmptyMessage(filteredTasks.length);
}

async function updateTask(taskId, changes) {
  const taskToUpdate = tasks.find(function (task) {
    return task.id === taskId;
  });

  if (!taskToUpdate) {
    return;
  }

  const updatedTask = {
    ...taskToUpdate,
    ...changes,
  };

  try {
    const savedTask = await requestTaskJson(taskApiBaseUrl + "/" + taskId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTask),
    });

    tasks = tasks.map(function (task) {
      if (task.id === taskId) {
        return savedTask;
      }

      return task;
    });

    renderTasks();
  } catch (error) {
    showTaskStatus(error.message || "The server could not update the task.");
  }
}

async function deleteTask(taskId) {
  try {
    await requestTaskJson(taskApiBaseUrl + "/" + taskId, {
      method: "DELETE",
    });

    tasks = tasks.filter(function (task) {
      return task.id !== taskId;
    });

    renderTasks();
    showTaskStatus("Task deleted.");
  } catch (error) {
    showTaskStatus(error.message || "The server could not delete the task.");
  }
}

async function startEditingTask(task) {
  // prompt() keeps editing simple for a beginner project.
  const updatedText = prompt("Edit your task text:", task.text);

  if (updatedText === null) {
    return;
  }

  const trimmedText = updatedText.trim();

  if (trimmedText === "") {
    showTaskStatus("A task cannot be empty.");
    return;
  }

  const updatedCategory = prompt("Edit category:", task.category);

  if (updatedCategory === null) {
    return;
  }

  const updatedPriority = prompt(
    "Edit priority: Low, Medium, or High",
    task.priority
  );

  if (updatedPriority === null) {
    return;
  }

  const updatedDueDate = prompt(
    "Edit due date in YYYY-MM-DD format. Leave blank for no due date.",
    task.dueDate
  );

  if (updatedDueDate === null) {
    return;
  }

  await updateTask(task.id, {
    text: trimmedText,
    category: updatedCategory.trim() || "General",
    priority: normalizePriority(updatedPriority),
    dueDate: updatedDueDate.trim(),
  });

  showTaskStatus("Task updated.");
}

async function requestTaskJson(url, options) {
  const response = await fetch(url, options);

  if (response.status === 401) {
    currentUser = null;
    tasks = [];
    renderTasks();
    showAuthSection("Your session ended. Please log in again.");
    throw new Error("Please log in first.");
  }

  if (response.status === 204) {
    return null;
  }

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || "The request failed.");
  }

  return responseData;
}

function setAuthMode(nextMode) {
  authMode = nextMode;

  authModeButtons.forEach(function (button) {
    button.classList.toggle("active", button.dataset.mode === nextMode);
  });

  if (nextMode === "register") {
    authSubmitButton.textContent = "Create Account";
    authPasswordInput.autocomplete = "new-password";
    authHelperText.textContent =
      "Register a new account. Your password must be at least 8 characters long.";
  } else {
    authSubmitButton.textContent = "Login";
    authPasswordInput.autocomplete = "current-password";
    authHelperText.textContent =
      "Log in with your existing account to see your tasks.";
  }

  hideAuthStatus();
}

function showAuthSection(message) {
  authSection.classList.remove("hidden");
  todoSection.classList.add("hidden");
  currentFilter = "all";
  updateActiveFilterButton();
  currentUserLabel.textContent = "";
  authForm.reset();
  todoList.innerHTML = "";
  authPasswordInput.value = "";
  authUsernameInput.focus();

  if (message) {
    showAuthStatus(message);
  } else {
    hideAuthStatus();
  }
}

function showTodoSection() {
  authSection.classList.add("hidden");
  todoSection.classList.remove("hidden");
  currentUserLabel.textContent = currentUser.username;
  hideAuthStatus();
}

function normalizePriority(priorityText) {
  const cleanedPriority = priorityText.trim().toLowerCase();

  if (cleanedPriority === "high") {
    return "High";
  }

  if (cleanedPriority === "low") {
    return "Low";
  }

  return "Medium";
}

function updateTaskCount() {
  const activeTasks = tasks.filter(function (task) {
    return !task.completed;
  });

  const totalTasks = tasks.length;
  taskCount.textContent =
    totalTasks + " task" + (totalTasks === 1 ? "" : "s") +
    " | " +
    activeTasks.length +
    " active";
}

function updateEmptyMessage(filteredTaskCount) {
  if (filteredTaskCount === 0) {
    emptyMessage.classList.remove("hidden");

    if (tasks.length === 0) {
      emptyMessage.textContent = "No tasks yet. Add your first one above.";
    } else {
      emptyMessage.textContent = "No tasks match the current filter.";
    }

    return;
  }

  emptyMessage.classList.add("hidden");
}

function updateActiveFilterButton() {
  filterButtons.forEach(function (button) {
    button.classList.toggle("active", button.dataset.filter === currentFilter);
  });
}

function showTaskStatus(message) {
  statusMessage.textContent = message;
  statusMessage.classList.remove("hidden");

  window.clearTimeout(showTaskStatus.timeoutId);
  showTaskStatus.timeoutId = window.setTimeout(function () {
    statusMessage.classList.add("hidden");
  }, 2500);
}

function showAuthStatus(message) {
  authStatusMessage.textContent = message;
  authStatusMessage.classList.remove("hidden");

  window.clearTimeout(showAuthStatus.timeoutId);
  showAuthStatus.timeoutId = window.setTimeout(function () {
    authStatusMessage.classList.add("hidden");
  }, 3000);
}

function hideAuthStatus() {
  authStatusMessage.classList.add("hidden");
}

function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDueDate(dateString) {
  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
