const authSection = document.getElementById("auth-section");
const todoSection = document.getElementById("todo-section");
const authMainView = document.getElementById("auth-main-view");
const authForm = document.getElementById("auth-form");
const authUsernameInput = document.getElementById("auth-username-input");
const authEmailGroup = document.getElementById("auth-email-group");
const authEmailInput = document.getElementById("auth-email-input");
const authPasswordInput = document.getElementById("auth-password-input");
const authSubmitButton = document.getElementById("auth-submit-btn");
const authHelperText = document.getElementById("auth-helper-text");
const authStatusMessage = document.getElementById("auth-status-message");
const authModeButtons = document.querySelectorAll(".auth-toggle-btn");
const showForgotPasswordButton = document.getElementById(
  "show-forgot-password-btn"
);
const passwordResetPanel = document.getElementById("password-reset-panel");
const resetPasswordHelperText = document.getElementById(
  "reset-password-helper-text"
);
const forgotPasswordForm = document.getElementById("forgot-password-form");
const forgotEmailInput = document.getElementById("forgot-email-input");
const resetPasswordForm = document.getElementById("reset-password-form");
const resetPasswordInput = document.getElementById("reset-password-input");
const confirmResetPasswordInput = document.getElementById(
  "confirm-reset-password-input"
);
const resetPasswordSubmitButton = document.getElementById(
  "reset-password-submit-btn"
);
const currentUserLabel = document.getElementById("current-user");
const logoutButton = document.getElementById("logout-btn");
const languageSelect = document.getElementById("language-select");

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
const languageStorageKey = "todo-app-language";
const defaultLanguage = "en";
const translations = {
  en: {
    pageTitle: "Simple To-Do List",
    eyebrow: "Beginner Project",
    appTitle: "My To-Do List",
    subtitle: "Create an account, log in, and manage only your own saved tasks.",
    languageLabel: "Language",
    authToggleAria: "Choose login or registration",
    login: "Login",
    register: "Register",
    usernameLabel: "Username",
    usernamePlaceholder: "Choose a username",
    emailLabel: "Email",
    emailPlaceholder: "Enter your email address",
    passwordLabel: "Password",
    passwordPlaceholder: "Use at least 8 characters",
    forgotPassword: "Forgot password?",
    resetPasswordTitle: "Reset Password",
    resetPasswordHelper:
      "Enter your account email to get a reset link, then open that link to choose a new password.",
    forgotPasswordStepMessage:
      "Enter your email address and we will send you a reset link.",
    forgotPasswordEmailLabel: "Email",
    forgotPasswordEmailPlaceholder: "Enter your account email",
    sendResetLink: "Send Reset Link",
    newPasswordLabel: "New Password",
    newPasswordPlaceholder: "Enter your new password",
    confirmNewPasswordLabel: "Confirm New Password",
    confirmNewPasswordPlaceholder: "Enter the same password again",
    resetPasswordButton: "Reset Password",
    loggedInAs: "Logged in as",
    logout: "Logout",
    taskPlaceholder: "What do you need to do?",
    categoryPlaceholder: "Category (example: School)",
    priorityLowOption: "Low Priority",
    priorityMediumOption: "Medium Priority",
    priorityHighOption: "High Priority",
    addTask: "Add Task",
    taskFilters: "Task filters",
    all: "All",
    active: "Active",
    completed: "Completed",
    clearCompleted: "Clear Completed",
    emptyMessage: "No tasks yet. Add your first one above.",
    noTasksMatchFilter: "No tasks match the current filter.",
    loginSuccess: "Logged in successfully.",
    registerSuccess: "Account created successfully.",
    createAccount: "Create Account",
    authHelperLogin: "Log in with your existing account to see your tasks.",
    authHelperRegister:
      "Register a new account with a username, email, and password.",
    enterUsernameAndPassword: "Please enter both a username and password.",
    enterUsernameEmailAndPassword:
      "Please enter a username, email, and password.",
    enterEmailForReset: "Please enter your email address first.",
    openResetLinkFirst:
      "Open the reset link from your email first, then choose a new password.",
    enterNewPasswordAndConfirmation:
      "Enter your new password and confirm it.",
    passwordTooShort: "Your new password must be at least 8 characters long.",
    passwordsDoNotMatch: "The two password fields must match.",
    authenticationFailed: "Authentication failed.",
    couldNotLogOut: "Could not log out.",
    loggedOut: "You have been logged out.",
    serverCouldNotLogYouOut: "The server could not log you out.",
    enterTaskBeforeAdding: "Please enter a task before adding it.",
    generalCategory: "General",
    taskAdded: "Task added.",
    serverCouldNotSaveTask: "The server could not save the task.",
    noCompletedTasksToClear: "There are no completed tasks to clear.",
    completedTasksCleared: "Completed tasks cleared.",
    serverCouldNotClearCompleted: "The server could not clear completed tasks.",
    couldNotCheckLoginStatus: "Could not check login status.",
    appCouldNotCheckLoginStatus: "The app could not check your login status.",
    appCouldNotLoadTasks: "The app could not load tasks from the server.",
    categoryLabel: "Category",
    priorityLabel: "Priority",
    createdLabel: "Created",
    dueLabel: "Due",
    undo: "Undo",
    done: "Done",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    serverCouldNotUpdateTask: "The server could not update the task.",
    taskDeleted: "Task deleted.",
    serverCouldNotDeleteTask: "The server could not delete the task.",
    invalidDueDate: "Please use YYYY-MM-DD for the due date.",
    saving: "Saving...",
    editTaskTextPrompt: "Edit your task text:",
    taskCannotBeEmpty: "A task cannot be empty.",
    editCategoryPrompt: "Edit category:",
    editPriorityPrompt: "Edit priority: Low, Medium, or High",
    editDueDatePrompt:
      "Edit due date in YYYY-MM-DD format. Leave blank for no due date.",
    low: "Low",
    medium: "Medium",
    high: "High",
    taskUpdated: "Task updated.",
    sessionEnded: "Your session ended. Please log in again.",
    pleaseLogInFirst: "Please log in first.",
    requestFailed: "The request failed.",
    taskCountSingular: "{count} task",
    taskCountPlural: "{count} tasks",
    activeCount: "{count} active",
    forgotPasswordSent:
      "If that email exists, a reset email is on the way.",
    passwordResetReady:
      "Reset link detected. Enter your new password below.",
    resetPasswordStepMessage:
      "Choose a new password for your account.",
    passwordResetSuccess: "Password successfully updated",
    passwordResetFailed: "Invalid or expired reset link",
    passwordResetEmailNotConfigured:
      "Password reset email is not set up on the server yet.",
    passwordResetEmailSendFailed:
      "The reset email could not be sent right now. Please try again.",
    resetPasswordSubmitting: "Updating...",
  },
  uk: {
    pageTitle: "Простий список справ",
    eyebrow: "Проєкт для початківців",
    appTitle: "Мій список справ",
    subtitle:
      "Створіть акаунт, увійдіть і керуйте лише власними збереженими завданнями.",
    languageLabel: "Мова",
    authToggleAria: "Оберіть вхід або реєстрацію",
    login: "Увійти",
    register: "Реєстрація",
    usernameLabel: "Ім'я користувача",
    usernamePlaceholder: "Виберіть ім'я користувача",
    emailLabel: "Електронна пошта",
    emailPlaceholder: "Введіть адресу електронної пошти",
    passwordLabel: "Пароль",
    passwordPlaceholder: "Використайте щонайменше 8 символів",
    forgotPassword: "Забули пароль?",
    resetPasswordTitle: "Скидання пароля",
    resetPasswordHelper:
      "Введіть пошту акаунта, щоб отримати посилання, а потім відкрийте його, щоб вибрати новий пароль.",
    forgotPasswordStepMessage:
      "Введіть адресу електронної пошти, і ми надішлемо посилання для скидання.",
    forgotPasswordEmailLabel: "Електронна пошта",
    forgotPasswordEmailPlaceholder: "Введіть пошту акаунта",
    sendResetLink: "Надіслати посилання",
    newPasswordLabel: "Новий пароль",
    newPasswordPlaceholder: "Введіть новий пароль",
    confirmNewPasswordLabel: "Підтвердьте новий пароль",
    confirmNewPasswordPlaceholder: "Введіть той самий пароль ще раз",
    resetPasswordButton: "Скинути пароль",
    loggedInAs: "Увійшли як",
    logout: "Вийти",
    taskPlaceholder: "Що вам потрібно зробити?",
    categoryPlaceholder: "Категорія (наприклад: Навчання)",
    priorityLowOption: "Низький пріоритет",
    priorityMediumOption: "Середній пріоритет",
    priorityHighOption: "Високий пріоритет",
    addTask: "Додати завдання",
    taskFilters: "Фільтри завдань",
    all: "Усі",
    active: "Активні",
    completed: "Виконані",
    clearCompleted: "Очистити виконані",
    emptyMessage: "Завдань ще немає. Додайте перше вище.",
    noTasksMatchFilter: "Немає завдань для поточного фільтра.",
    loginSuccess: "Вхід виконано успішно.",
    registerSuccess: "Акаунт успішно створено.",
    createAccount: "Створити акаунт",
    authHelperLogin: "Увійдіть у свій акаунт, щоб побачити завдання.",
    authHelperRegister:
      "Зареєструйте новий акаунт з іменем, поштою та паролем.",
    enterUsernameAndPassword: "Будь ласка, введіть ім'я користувача та пароль.",
    enterUsernameEmailAndPassword:
      "Будь ласка, введіть ім'я користувача, пошту та пароль.",
    enterEmailForReset: "Спочатку введіть адресу електронної пошти.",
    openResetLinkFirst:
      "Спочатку відкрийте посилання з листа, а потім виберіть новий пароль.",
    enterNewPasswordAndConfirmation:
      "Введіть новий пароль і підтвердження.",
    passwordTooShort: "Новий пароль має містити щонайменше 8 символів.",
    passwordsDoNotMatch: "Обидва поля пароля мають збігатися.",
    authenticationFailed: "Помилка автентифікації.",
    couldNotLogOut: "Не вдалося вийти.",
    loggedOut: "Ви вийшли з акаунта.",
    serverCouldNotLogYouOut: "Сервер не зміг завершити вихід.",
    enterTaskBeforeAdding: "Введіть завдання перед додаванням.",
    generalCategory: "Загальне",
    taskAdded: "Завдання додано.",
    serverCouldNotSaveTask: "Сервер не зміг зберегти завдання.",
    noCompletedTasksToClear: "Немає виконаних завдань для очищення.",
    completedTasksCleared: "Виконані завдання очищено.",
    serverCouldNotClearCompleted:
      "Сервер не зміг очистити виконані завдання.",
    couldNotCheckLoginStatus: "Не вдалося перевірити стан входу.",
    appCouldNotCheckLoginStatus:
      "Програма не змогла перевірити ваш стан входу.",
    appCouldNotLoadTasks: "Програма не змогла завантажити завдання із сервера.",
    categoryLabel: "Категорія",
    priorityLabel: "Пріоритет",
    createdLabel: "Створено",
    dueLabel: "Термін",
    undo: "Скасувати",
    done: "Готово",
    edit: "Редагувати",
    save: "Зберегти",
    cancel: "Скасувати",
    delete: "Видалити",
    serverCouldNotUpdateTask: "Сервер не зміг оновити завдання.",
    taskDeleted: "Завдання видалено.",
    serverCouldNotDeleteTask: "Сервер не зміг видалити завдання.",
    invalidDueDate:
      "Будь ласка, використайте формат YYYY-MM-DD для дати.",
    saving: "Збереження...",
    editTaskTextPrompt: "Відредагуйте текст завдання:",
    taskCannotBeEmpty: "Завдання не може бути порожнім.",
    editCategoryPrompt: "Відредагуйте категорію:",
    editPriorityPrompt: "Відредагуйте пріоритет: Low, Medium або High",
    editDueDatePrompt:
      "Відредагуйте дату у форматі YYYY-MM-DD. Залиште порожнім, якщо дати немає.",
    low: "Низький",
    medium: "Середній",
    high: "Високий",
    taskUpdated: "Завдання оновлено.",
    sessionEnded: "Сеанс завершився. Будь ласка, увійдіть знову.",
    pleaseLogInFirst: "Спочатку увійдіть у систему.",
    requestFailed: "Помилка запиту.",
    taskCountSingular: "{count} завдання",
    taskCountPlural: "{count} завдань",
    activeCount: "активних: {count}",
    forgotPasswordSent:
      "Якщо така пошта існує, лист для скидання вже в дорозі.",
    passwordResetReady:
      "Посилання для скидання знайдено. Тепер введіть новий пароль нижче.",
    resetPasswordStepMessage:
      "Виберіть новий пароль для свого акаунта.",
    passwordResetSuccess: "Пароль успішно оновлено",
    passwordResetFailed: "Недійсне або прострочене посилання для скидання",
    passwordResetEmailNotConfigured:
      "Надсилання листів для скидання пароля ще не налаштоване на сервері.",
    passwordResetEmailSendFailed:
      "Зараз не вдалося надіслати лист для скидання. Спробуйте ще раз.",
    resetPasswordSubmitting: "Оновлення...",
  },
};

// The browser keeps a copy of the server data in this array while the page is open.
let tasks = [];
let currentFilter = "all";
let currentUser = null;
let authMode = "login";
let authView = "auth";
let currentLanguage = getStoredLanguage();
let currentResetToken = "";
let editingTaskId = null;

languageSelect.value = currentLanguage;
applyTranslations();
setAuthMode("login");
prefillResetTokenFromUrl();
checkSession();

languageSelect.addEventListener("change", function () {
  currentLanguage = languageSelect.value;
  localStorage.setItem(languageStorageKey, currentLanguage);
  applyTranslations();
  renderTasks();
});

authModeButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    setAuthMode(button.dataset.mode);
  });
});

showForgotPasswordButton.addEventListener("click", function () {
  setAuthView("forgot-password");
  focusBestResetField();
});

authForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = authUsernameInput.value.trim();
  const email = authEmailInput.value.trim();
  const password = authPasswordInput.value;

  if (authMode === "register") {
    if (username === "" || email === "" || password === "") {
      showAuthStatus(t("enterUsernameEmailAndPassword"));
      return;
    }
  } else if (username === "" || password === "") {
    showAuthStatus(t("enterUsernameAndPassword"));
    return;
  }

  try {
    const requestBody = {
      username: username,
      password: password,
    };

    if (authMode === "register") {
      requestBody.email = email;
    }

    const response = await fetch(authApiBaseUrl + "/" + authMode, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || t("authenticationFailed"));
    }

    currentUser = responseData.user;
    authForm.reset();
    setAuthView("auth");
    showTodoSection();
    showTaskStatus(authMode === "register" ? t("registerSuccess") : t("loginSuccess"));
    await loadTasks();
  } catch (error) {
    showAuthStatus(error.message);
  }
});

forgotPasswordForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = forgotEmailInput.value.trim();

  if (email === "") {
    showAuthStatus(t("enterEmailForReset"));
    return;
  }

  try {
    const response = await fetch(authApiBaseUrl + "/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || t("requestFailed"));
    }

    forgotPasswordForm.reset();
    showAuthStatus(responseData.message || t("forgotPasswordSent"));
  } catch (error) {
    showAuthStatus(error.message);
  }
});

resetPasswordForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const token = currentResetToken;
  const password = resetPasswordInput.value;
  const confirmPassword = confirmResetPasswordInput.value;

  if (token === "") {
    showAuthStatus(t("openResetLinkFirst"));
    return;
  }

  if (password === "" || confirmPassword === "") {
    showAuthStatus(t("enterNewPasswordAndConfirmation"));
    return;
  }

  if (password.length < 8) {
    showAuthStatus(t("passwordTooShort"));
    resetPasswordInput.focus();
    return;
  }

  if (password !== confirmPassword) {
    showAuthStatus(t("passwordsDoNotMatch"));
    confirmResetPasswordInput.focus();
    return;
  }

  try {
    setResetPasswordSubmitting(true);

    const response = await fetch(authApiBaseUrl + "/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
        password: password,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || t("requestFailed"));
    }

    resetPasswordForm.reset();
    clearResetTokenFromUrl();
    setAuthView("auth");
    setAuthMode("login");
    authPasswordInput.value = "";
    authPasswordInput.focus();
    showAuthStatus(t("passwordResetSuccess"));
  } catch (error) {
    showAuthStatus(makeFriendlyResetErrorMessage(error.message));
  } finally {
    setResetPasswordSubmitting(false);
  }
});

logoutButton.addEventListener("click", async function () {
  try {
    const response = await fetch(authApiBaseUrl + "/logout", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(t("couldNotLogOut"));
    }

    currentUser = null;
    tasks = [];
    todoForm.reset();
    renderTasks();
    showAuthSection(t("loggedOut"));
  } catch (error) {
    showTaskStatus(t("serverCouldNotLogYouOut"));
  }
});

todoForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const taskText = todoInput.value.trim();
  const category = categoryInput.value.trim();
  const priority = priorityInput.value;
  const dueDate = dueDateInput.value;

  if (taskText === "") {
    showTaskStatus(t("enterTaskBeforeAdding"));
    return;
  }

  const newTask = {
    text: taskText,
    category: category === "" ? t("generalCategory") : category,
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
    showTaskStatus(t("taskAdded"));
  } catch (error) {
    showTaskStatus(error.message || t("serverCouldNotSaveTask"));
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
    showTaskStatus(t("noCompletedTasksToClear"));
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
    showTaskStatus(t("completedTasksCleared"));
  } catch (error) {
    showTaskStatus(error.message || t("serverCouldNotClearCompleted"));
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
      throw new Error(t("couldNotCheckLoginStatus"));
    }

    currentUser = responseData.user;
    showTodoSection();
    await loadTasks();
  } catch (error) {
    showAuthSection(t("appCouldNotCheckLoginStatus"));
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
    showTaskStatus(error.message || t("appCouldNotLoadTasks"));
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

    if (editingTaskId === task.id) {
      listItem.classList.add("editing");
    }

    const mainRow = document.createElement("div");
    mainRow.className = "todo-main";

    const content = document.createElement("div");
    content.className = "todo-content";

    const actions = document.createElement("div");
    actions.className = "todo-actions";

    if (editingTaskId === task.id) {
      content.appendChild(createTaskEditForm(task));
    } else {
      content.appendChild(createTaskDisplayContent(task));
      actions.appendChild(createCompleteButton(task));
      actions.appendChild(createEditButton(task));
    }

    actions.appendChild(createDeleteButton(task));

    mainRow.appendChild(content);
    mainRow.appendChild(actions);
    listItem.appendChild(mainRow);
    todoList.appendChild(listItem);
  });

  updateTaskCount();
  updateEmptyMessage(filteredTasks.length);
}

function createTaskDisplayContent(task) {
  const fragment = document.createDocumentFragment();

  const taskText = document.createElement("p");
  taskText.className = "todo-text";
  taskText.textContent = task.text;

  const metaRow = document.createElement("div");
  metaRow.className = "todo-meta";

  const categoryBadge = document.createElement("span");
  categoryBadge.className = "meta-badge";
  categoryBadge.textContent = t("categoryLabel") + ": " + task.category;

  const priorityBadge = document.createElement("span");
  priorityBadge.className = "meta-badge priority-" + task.priority.toLowerCase();
  priorityBadge.textContent =
    t("priorityLabel") + ": " + translatePriority(task.priority);

  const taskDate = document.createElement("p");
  taskDate.className = "todo-date";
  taskDate.textContent = t("createdLabel") + ": " + formatDate(task.createdAt);

  metaRow.appendChild(categoryBadge);
  metaRow.appendChild(priorityBadge);

  fragment.appendChild(taskText);
  fragment.appendChild(metaRow);

  if (task.dueDate) {
    const dueDate = document.createElement("p");
    dueDate.className = "todo-due-date";
    dueDate.textContent = t("dueLabel") + ": " + formatDueDate(task.dueDate);
    fragment.appendChild(dueDate);
  }

  fragment.appendChild(taskDate);

  return fragment;
}

function createTaskEditForm(task) {
  const form = document.createElement("form");
  form.className = "task-edit-form";

  const textInput = document.createElement("input");
  textInput.className = "task-edit-input task-edit-text";
  textInput.type = "text";
  textInput.value = task.text;
  textInput.placeholder = t("taskPlaceholder");
  textInput.autocomplete = "off";

  const secondaryFields = document.createElement("div");
  secondaryFields.className = "task-edit-grid";

  const categoryField = document.createElement("input");
  categoryField.className = "task-edit-input";
  categoryField.type = "text";
  categoryField.value = task.category;
  categoryField.placeholder = t("categoryPlaceholder");
  categoryField.autocomplete = "off";

  const priorityField = document.createElement("select");
  priorityField.className = "task-edit-input task-edit-select";
  [
    { value: "Low", label: t("priorityLowOption") },
    { value: "Medium", label: t("priorityMediumOption") },
    { value: "High", label: t("priorityHighOption") },
  ].forEach(function (optionConfig) {
    const option = document.createElement("option");
    option.value = optionConfig.value;
    option.textContent = optionConfig.label;
    option.selected = optionConfig.value === task.priority;
    priorityField.appendChild(option);
  });

  const dueDateField = document.createElement("input");
  dueDateField.className = "task-edit-input";
  dueDateField.type = "date";
  dueDateField.value = task.dueDate || "";

  const formActions = document.createElement("div");
  formActions.className = "task-edit-actions";

  const saveButton = document.createElement("button");
  saveButton.className = "save-btn";
  saveButton.type = "submit";
  saveButton.textContent = t("save");

  const cancelButton = document.createElement("button");
  cancelButton.className = "cancel-btn";
  cancelButton.type = "button";
  cancelButton.textContent = t("cancel");
  cancelButton.addEventListener("click", function () {
    editingTaskId = null;
    renderTasks();
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const nextText = textInput.value.trim();
    const nextCategory = categoryField.value.trim();
    const nextDueDate = dueDateField.value.trim();

    if (nextText === "") {
      showTaskStatus(t("taskCannotBeEmpty"));
      textInput.focus();
      return;
    }

    if (nextDueDate !== "" && !isValidDueDate(nextDueDate)) {
      showTaskStatus(t("invalidDueDate"));
      dueDateField.focus();
      return;
    }

    setTaskEditFormSubmitting(form, true);

    const didSave = await updateTask(
      task.id,
      {
        text: nextText,
        category: nextCategory || t("generalCategory"),
        priority: priorityField.value,
        dueDate: nextDueDate,
      },
      {
        skipRender: true,
      }
    );

    setTaskEditFormSubmitting(form, false);

    if (!didSave) {
      return;
    }

    editingTaskId = null;
    renderTasks();
    showTaskStatus(t("taskUpdated"));
  });

  secondaryFields.appendChild(categoryField);
  secondaryFields.appendChild(priorityField);
  secondaryFields.appendChild(dueDateField);
  formActions.appendChild(saveButton);
  formActions.appendChild(cancelButton);

  form.appendChild(textInput);
  form.appendChild(secondaryFields);
  form.appendChild(formActions);

  window.setTimeout(function () {
    textInput.focus();
    textInput.setSelectionRange(textInput.value.length, textInput.value.length);
  }, 0);

  return form;
}

function createCompleteButton(task) {
  const completeButton = document.createElement("button");
  completeButton.className = "complete-btn";
  completeButton.textContent = task.completed ? t("undo") : t("done");
  completeButton.addEventListener("click", async function () {
    await updateTask(task.id, {
      completed: !task.completed,
    });
  });
  return completeButton;
}

function createEditButton(task) {
  const editButton = document.createElement("button");
  editButton.className = "edit-btn";
  editButton.textContent = t("edit");
  editButton.addEventListener("click", function () {
    editingTaskId = task.id;
    renderTasks();
  });
  return editButton;
}

function createDeleteButton(task) {
  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-btn";
  deleteButton.textContent = t("delete");
  deleteButton.addEventListener("click", async function () {
    await deleteTask(task.id);
  });
  return deleteButton;
}

async function updateTask(taskId, changes, options) {
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

    if (!options || !options.skipRender) {
      renderTasks();
    }

    return true;
  } catch (error) {
    showTaskStatus(error.message || t("serverCouldNotUpdateTask"));
    return false;
  }
}

async function deleteTask(taskId) {
  try {
    await requestTaskJson(taskApiBaseUrl + "/" + taskId, {
      method: "DELETE",
    });

    if (editingTaskId === taskId) {
      editingTaskId = null;
    }

    tasks = tasks.filter(function (task) {
      return task.id !== taskId;
    });

    renderTasks();
    showTaskStatus(t("taskDeleted"));
  } catch (error) {
    showTaskStatus(error.message || t("serverCouldNotDeleteTask"));
  }
}

async function requestTaskJson(url, options) {
  const response = await fetch(url, options);

  if (response.status === 401) {
    currentUser = null;
    tasks = [];
    renderTasks();
    showAuthSection(t("sessionEnded"));
    throw new Error(t("pleaseLogInFirst"));
  }

  if (response.status === 204) {
    return null;
  }

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || t("requestFailed"));
  }

  return responseData;
}

function setAuthMode(nextMode) {
  authMode = nextMode;

  authModeButtons.forEach(function (button) {
    button.classList.toggle("active", button.dataset.mode === nextMode);
  });

  const isRegisterMode = nextMode === "register";
  authEmailGroup.classList.toggle("hidden", !isRegisterMode);

  if (isRegisterMode) {
    authSubmitButton.textContent = t("createAccount");
    authPasswordInput.autocomplete = "new-password";
    authHelperText.textContent = t("authHelperRegister");
  } else {
    authSubmitButton.textContent = t("login");
    authPasswordInput.autocomplete = "current-password";
    authHelperText.textContent = t("authHelperLogin");
  }

  hideAuthStatus();
}

function setAuthView(nextView) {
  authView = nextView;

  const isNormalAuthView = nextView === "auth";
  const isForgotPasswordView = nextView === "forgot-password";
  const isResetPasswordView = nextView === "reset-password";

  authMainView.classList.toggle("hidden", !isNormalAuthView);
  passwordResetPanel.classList.toggle(
    "hidden",
    !isForgotPasswordView && !isResetPasswordView
  );

  forgotPasswordForm.classList.toggle("hidden", !isForgotPasswordView);
  resetPasswordForm.classList.toggle("hidden", !isResetPasswordView);

  authHelperText.classList.toggle("hidden", !isNormalAuthView);
  updateResetPasswordHelperText();
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
  setAuthView(currentResetToken ? "reset-password" : "auth");
  focusBestResetField();

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

function hidePasswordResetPanel() {
  forgotPasswordForm.reset();
  resetPasswordForm.reset();
  currentResetToken = "";
  setAuthView("auth");
  setResetPasswordSubmitting(false);
}

function prefillResetTokenFromUrl() {
  const url = new URL(window.location.href);
  const resetToken = url.searchParams.get("resetToken");

  if (!resetToken) {
    return;
  }

  currentResetToken = resetToken;
  setAuthView("reset-password");
  resetPasswordInput.focus();
}

function clearResetTokenFromUrl() {
  const url = new URL(window.location.origin + "/");
  currentResetToken = "";
  setAuthView("auth");
  window.history.replaceState({}, "", url.pathname + url.search);
}

function focusBestResetField() {
  if (authView === "reset-password") {
    resetPasswordInput.focus();
    return;
  }

  if (authView === "forgot-password") {
    forgotEmailInput.focus();
    return;
  }

  authUsernameInput.focus();
}

function makeFriendlyResetErrorMessage(serverMessage) {
  if (
    serverMessage === "That reset token is invalid or has expired." ||
    serverMessage === "Reset token is required."
  ) {
    return t("passwordResetFailed");
  }

  if (
    serverMessage ===
    "Password reset email is not configured on the server yet. Add the email environment variables and try again."
  ) {
    return t("passwordResetEmailNotConfigured");
  }

  if (
    serverMessage ===
    "The server could not send the password reset email. Please try again."
  ) {
    return t("passwordResetEmailSendFailed");
  }

  return serverMessage || t("requestFailed");
}

function updateResetPasswordHelperText() {
  if (!resetPasswordHelperText) {
    return;
  }

  if (authView === "reset-password") {
    resetPasswordHelperText.textContent = t("resetPasswordStepMessage");
    return;
  }

  resetPasswordHelperText.textContent = t("forgotPasswordStepMessage");
}

function setResetPasswordSubmitting(isSubmitting) {
  if (!resetPasswordSubmitButton) {
    return;
  }

  resetPasswordSubmitButton.disabled = isSubmitting;
  resetPasswordSubmitButton.textContent = isSubmitting
    ? t("resetPasswordSubmitting")
    : t("resetPasswordButton");
}

function normalizePriority(priorityText) {
  const cleanedPriority = priorityText.trim().toLowerCase();

  if (cleanedPriority === "high" || cleanedPriority === "високий") {
    return "High";
  }

  if (cleanedPriority === "low" || cleanedPriority === "низький") {
    return "Low";
  }

  return "Medium";
}

function updateTaskCount() {
  const activeTasks = tasks.filter(function (task) {
    return !task.completed;
  });

  const totalTasks = tasks.length;
  const totalTasksLabel =
    totalTasks === 1
      ? t("taskCountSingular", { count: totalTasks })
      : t("taskCountPlural", { count: totalTasks });

  taskCount.textContent =
    totalTasksLabel + " | " + t("activeCount", { count: activeTasks.length });
}

function updateEmptyMessage(filteredTaskCount) {
  if (filteredTaskCount === 0) {
    emptyMessage.classList.remove("hidden");

    if (tasks.length === 0) {
      emptyMessage.textContent = t("emptyMessage");
    } else {
      emptyMessage.textContent = t("noTasksMatchFilter");
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
  }, 4000);
}

function hideAuthStatus() {
  authStatusMessage.classList.add("hidden");
}

function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleString(getLocale(), {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDueDate(dateString) {
  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString(getLocale(), {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isValidDueDate(dateString) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}

function setTaskEditFormSubmitting(form, isSubmitting) {
  const saveButton = form.querySelector(".save-btn");
  const cancelButton = form.querySelector(".cancel-btn");
  const fields = form.querySelectorAll("input, select, button");

  fields.forEach(function (field) {
    field.disabled = isSubmitting;
  });

  if (saveButton) {
    saveButton.textContent = isSubmitting ? t("saving") : t("save");
  }

  if (cancelButton) {
    cancelButton.textContent = t("cancel");
  }
}

function getStoredLanguage() {
  const savedLanguage = localStorage.getItem(languageStorageKey);

  if (translations[savedLanguage]) {
    return savedLanguage;
  }

  return defaultLanguage;
}

function t(key, replacements) {
  const currentTranslations = translations[currentLanguage] || translations.en;
  let text = currentTranslations[key] || translations.en[key] || key;

  if (replacements) {
    Object.keys(replacements).forEach(function (replacementKey) {
      text = text.replace(
        "{" + replacementKey + "}",
        replacements[replacementKey]
      );
    });
  }

  return text;
}

function applyTranslations() {
  document.documentElement.lang = currentLanguage;
  document.title = t("pageTitle");

  document.querySelectorAll("[data-i18n]").forEach(function (element) {
    element.textContent = t(element.dataset.i18n);
  });

  document
    .querySelectorAll("[data-i18n-placeholder]")
    .forEach(function (element) {
      element.placeholder = t(element.dataset.i18nPlaceholder);
    });

  document
    .querySelectorAll("[data-i18n-aria-label]")
    .forEach(function (element) {
      element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
    });

  setAuthMode(authMode);
  updateResetPasswordHelperText();
  updateTaskCount();
  updateEmptyMessage(tasks.length);
}

function getLocale() {
  if (currentLanguage === "uk") {
    return "uk-UA";
  }

  return "en-US";
}

function translatePriority(priority) {
  if (priority === "High") {
    return t("high");
  }

  if (priority === "Low") {
    return t("low");
  }

  return t("medium");
}
