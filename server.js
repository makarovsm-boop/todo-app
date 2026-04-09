require("dotenv").config();
const crypto = require("crypto");
const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");
const { Resend } = require("resend");

const app = express();
const PORT = process.env.PORT || 3000;
const databasePath = path.join(__dirname, "todo.db");
const sessionCookieName = "todo_session";
const passwordResetLifetimeMs = 60 * 60 * 1000;
const resendApiKey = String(process.env.RESEND_API_KEY || "").trim();
const passwordResetSenderEmail = String(
  process.env.PASSWORD_RESET_FROM_EMAIL || ""
).trim();
const appBaseUrl = getAppBaseUrl();
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Opening the database file will create it if it does not exist yet.
const db = new Database(databasePath);
db.pragma("foreign_keys = ON");

// Sessions are kept in memory for this beginner project.
// Users stay saved in SQLite, but active logins reset if the server restarts.
const sessions = new Map();

app.use(express.json());
app.use(express.static(__dirname));

setupDatabase();

app.post("/auth/register", function (request, response) {
  const username = normalizeUsername(request.body.username);
  const email = normalizeEmail(request.body.email);
  const password = normalizePassword(request.body.password);

  if (username.length < 3) {
    response.status(400).json({
      error: "Username must be at least 3 characters long.",
    });
    return;
  }

  if (!isValidEmail(email)) {
    response.status(400).json({
      error: "Please enter a valid email address.",
    });
    return;
  }

  if (password.length < 8) {
    response.status(400).json({
      error: "Password must be at least 8 characters long.",
    });
    return;
  }

  const existingUser = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get(username);

  if (existingUser) {
    response.status(409).json({
      error: "That username is already taken.",
    });
    return;
  }

  const existingEmailUser = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email);

  if (existingEmailUser) {
    response.status(409).json({
      error: "That email address is already in use.",
    });
    return;
  }

  const passwordHash = hashPassword(password);
  const result = db
    .prepare(
      `
        INSERT INTO users (username, email, password)
        VALUES (?, ?, ?)
      `
    )
    .run(username, email, passwordHash);

  const createdUser = db
    .prepare("SELECT id, username, email FROM users WHERE id = ?")
    .get(result.lastInsertRowid);

  createSession(response, createdUser.id);

  response.status(201).json({
    message: "Account created successfully.",
    user: createdUser,
  });
});

app.post("/auth/forgot-password", async function (request, response) {
  const email = normalizeEmail(request.body.email);

  if (!isValidEmail(email)) {
    response.status(400).json({
      error: "Please enter a valid email address.",
    });
    return;
  }

  const user = db
    .prepare("SELECT id, email FROM users WHERE email = ?")
    .get(email);

  // This message stays the same even when the email does not exist.
  // It avoids revealing which emails belong to real accounts.
  const genericMessage =
    "If that email exists, a password reset email has been sent.";

  if (!isPasswordResetEmailConfigured()) {
    response.status(500).json({
      error:
        "Password reset email is not configured on the server yet. Add the email environment variables and try again.",
    });
    return;
  }

  if (!user) {
    response.json({
      message: genericMessage,
    });
    return;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedResetToken = hashResetToken(resetToken);
  const expiresAt = new Date(Date.now() + passwordResetLifetimeMs).toISOString();

  // Keep only the latest reset token per user to keep the beginner flow simple.
  db.prepare("DELETE FROM password_resets WHERE user_id = ?").run(user.id);

  db.prepare(
    `
      INSERT INTO password_resets (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `
  ).run(user.id, hashedResetToken, expiresAt);

  const resetLink = buildPasswordResetLink(resetToken);

  try {
    await sendPasswordResetEmail(user.email, resetLink, expiresAt);

    response.json({
      message: genericMessage,
    });
  } catch (error) {
    // If sending fails, remove the saved token so the next request starts cleanly.
    db.prepare("DELETE FROM password_resets WHERE user_id = ?").run(user.id);

    console.error("Could not send password reset email.");
    console.error(error);

    response.status(500).json({
      error:
        "The server could not send the password reset email. Please try again.",
    });
  }
});

app.post("/auth/reset-password", function (request, response) {
  const token = normalizeResetToken(request.body.token);
  const newPassword = normalizePassword(request.body.password);

  if (token === "") {
    response.status(400).json({
      error: "Reset token is required.",
    });
    return;
  }

  if (newPassword.length < 8) {
    response.status(400).json({
      error: "Password must be at least 8 characters long.",
    });
    return;
  }

  deleteExpiredPasswordResetTokens();

  const resetRow = db
    .prepare(
      `
        SELECT id, user_id, expires_at
        FROM password_resets
        WHERE token = ?
      `
    )
    .get(hashResetToken(token));

  if (!resetRow) {
    response.status(400).json({
      error: "That reset token is invalid or has expired.",
    });
    return;
  }

  if (new Date(resetRow.expires_at).getTime() < Date.now()) {
    db.prepare("DELETE FROM password_resets WHERE id = ?").run(resetRow.id);
    response.status(400).json({
      error: "That reset token is invalid or has expired.",
    });
    return;
  }

  const passwordHash = hashPassword(newPassword);

  db.prepare("UPDATE users SET password = ? WHERE id = ?").run(
    passwordHash,
    resetRow.user_id
  );
  db.prepare("DELETE FROM password_resets WHERE user_id = ?").run(resetRow.user_id);

  response.json({
    message: "Password reset successfully. You can now log in.",
  });
});

app.post("/auth/login", function (request, response) {
  const username = normalizeUsername(request.body.username);
  const password = normalizePassword(request.body.password);
  const user = db
    .prepare("SELECT id, username, password FROM users WHERE username = ?")
    .get(username);

  if (!user || !verifyPassword(password, user.password)) {
    response.status(401).json({
      error: "Incorrect username or password.",
    });
    return;
  }

  createSession(response, user.id);

  response.json({
    message: "Logged in successfully.",
    user: {
      id: user.id,
      username: user.username,
    },
  });
});

app.get("/auth/me", function (request, response) {
  const user = getAuthenticatedUser(request);

  if (!user) {
    response.status(401).json({
      error: "You are not logged in.",
    });
    return;
  }

  response.json({
    user: user,
  });
});

app.post("/auth/logout", function (request, response) {
  const sessionId = getSessionIdFromRequest(request);

  if (sessionId) {
    sessions.delete(sessionId);
  }

  clearSessionCookie(response);
  response.json({
    message: "Logged out successfully.",
  });
});

app.get("/tasks", requireAuth, function (request, response) {
  const rows = db
    .prepare(
      `
        SELECT * FROM tasks
        WHERE userId = ?
        ORDER BY id DESC
      `
    )
    .all(request.user.id);

  response.json(rows.map(mapTaskRow));
});

app.post("/tasks", requireAuth, function (request, response) {
  const text = request.body.text ? request.body.text.trim() : "";

  if (text === "") {
    response.status(400).json({
      error: "Task text is required.",
    });
    return;
  }

  const newTask = {
    userId: request.user.id,
    text: text,
    category: request.body.category || "General",
    priority: normalizePriority(request.body.priority),
    dueDate: request.body.dueDate || "",
    completed: 0,
    createdAt: new Date().toISOString(),
  };

  const result = db
    .prepare(
      `
        INSERT INTO tasks (userId, text, category, priority, dueDate, completed, createdAt)
        VALUES (@userId, @text, @category, @priority, @dueDate, @completed, @createdAt)
      `
    )
    .run(newTask);

  const createdTask = db
    .prepare("SELECT * FROM tasks WHERE id = ? AND userId = ?")
    .get(result.lastInsertRowid, request.user.id);

  response.status(201).json(mapTaskRow(createdTask));
});

app.put("/tasks/:id", requireAuth, function (request, response) {
  const taskId = Number(request.params.id);
  const existingTask = db
    .prepare("SELECT * FROM tasks WHERE id = ? AND userId = ?")
    .get(taskId, request.user.id);

  if (!existingTask) {
    response.status(404).json({
      error: "Task not found.",
    });
    return;
  }

  const updatedText = request.body.text ? request.body.text.trim() : "";

  if (updatedText === "") {
    response.status(400).json({
      error: "Task text is required.",
    });
    return;
  }

  const updatedTask = {
    id: taskId,
    userId: request.user.id,
    text: updatedText,
    category: request.body.category || "General",
    priority: normalizePriority(request.body.priority),
    dueDate: request.body.dueDate || "",
    completed: request.body.completed ? 1 : 0,
  };

  db.prepare(
    `
      UPDATE tasks
      SET text = @text,
          category = @category,
          priority = @priority,
          dueDate = @dueDate,
          completed = @completed
      WHERE id = @id AND userId = @userId
    `
  ).run(updatedTask);

  const savedTask = db
    .prepare("SELECT * FROM tasks WHERE id = ? AND userId = ?")
    .get(taskId, request.user.id);

  response.json(mapTaskRow(savedTask));
});

app.delete("/tasks/:id", requireAuth, function (request, response) {
  const taskId = Number(request.params.id);
  const result = db
    .prepare("DELETE FROM tasks WHERE id = ? AND userId = ?")
    .run(taskId, request.user.id);

  if (result.changes === 0) {
    response.status(404).json({
      error: "Task not found.",
    });
    return;
  }

  response.status(204).send();
});

app.get("/", function (request, response) {
  response.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, function () {
  console.log("Server running at http://localhost:" + PORT);
  console.log("Using SQLite database at " + databasePath);
  console.log("Password reset links use base URL: " + appBaseUrl);

  if (!isPasswordResetEmailConfigured()) {
    console.log(
      "Password reset email is not configured yet. Set RESEND_API_KEY and PASSWORD_RESET_FROM_EMAIL."
    );
  }
});

function setupDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      text TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL,
      dueDate TEXT,
      completed INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  addUserIdColumnIfMissing();
  addEmailColumnIfMissing();
  createPasswordResetIndexes();
  deleteExpiredPasswordResetTokens();
}

function addUserIdColumnIfMissing() {
  const taskColumns = db.prepare("PRAGMA table_info(tasks)").all();
  const hasUserIdColumn = taskColumns.some(function (column) {
    return column.name === "userId";
  });

  if (!hasUserIdColumn) {
    db.exec("ALTER TABLE tasks ADD COLUMN userId INTEGER");
  }
}

function addEmailColumnIfMissing() {
  const userColumns = db.prepare("PRAGMA table_info(users)").all();
  const hasEmailColumn = userColumns.some(function (column) {
    return column.name === "email";
  });

  if (!hasEmailColumn) {
    db.exec("ALTER TABLE users ADD COLUMN email TEXT");
  }

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique
    ON users(email)
    WHERE email IS NOT NULL
  `);
}

function createPasswordResetIndexes() {
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS password_resets_token_unique
    ON password_resets(token)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS password_resets_user_id_index
    ON password_resets(user_id)
  `);
}

function requireAuth(request, response, next) {
  const user = getAuthenticatedUser(request);

  if (!user) {
    response.status(401).json({
      error: "Please log in first.",
    });
    return;
  }

  request.user = user;
  next();
}

function getAuthenticatedUser(request) {
  const sessionId = getSessionIdFromRequest(request);

  if (!sessionId) {
    return null;
  }

  const userId = sessions.get(sessionId);

  if (!userId) {
    return null;
  }

  const user = db
    .prepare("SELECT id, username, email FROM users WHERE id = ?")
    .get(userId);

  if (!user) {
    sessions.delete(sessionId);
    return null;
  }

  return user;
}

function getSessionIdFromRequest(request) {
  const cookieHeader = request.headers.cookie || "";
  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const trimmedCookie = cookie.trim();

    if (trimmedCookie.startsWith(sessionCookieName + "=")) {
      return decodeURIComponent(trimmedCookie.split("=").slice(1).join("="));
    }
  }

  return "";
}

function createSession(response, userId) {
  const sessionId = crypto.randomBytes(32).toString("hex");
  sessions.set(sessionId, userId);
  response.setHeader("Set-Cookie", buildSessionCookie(sessionId));
}

function clearSessionCookie(response) {
  response.setHeader(
    "Set-Cookie",
    sessionCookieName + "=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0"
  );
}

function buildSessionCookie(sessionId) {
  return (
    sessionCookieName +
    "=" +
    encodeURIComponent(sessionId) +
    "; HttpOnly; Path=/; SameSite=Lax"
  );
}

function mapTaskRow(taskRow) {
  return {
    id: taskRow.id,
    userId: taskRow.userId,
    text: taskRow.text,
    category: taskRow.category,
    priority: taskRow.priority,
    dueDate: taskRow.dueDate,
    completed: Boolean(taskRow.completed),
    createdAt: taskRow.createdAt,
  };
}

function normalizePriority(priorityText) {
  const cleanedPriority = String(priorityText || "").trim().toLowerCase();

  if (cleanedPriority === "high") {
    return "High";
  }

  if (cleanedPriority === "low") {
    return "Low";
  }

  return "Medium";
}

function normalizeUsername(username) {
  return String(username || "").trim();
}

function normalizePassword(password) {
  return String(password || "");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeResetToken(token) {
  return String(token || "").trim();
}

function getAppBaseUrl() {
  const configuredUrl = String(process.env.APP_BASE_URL || "").trim();

  if (configuredUrl !== "") {
    return configuredUrl.replace(/\/+$/, "");
  }

  return "http://localhost:" + PORT;
}

function isValidEmail(email) {
  if (email === "") {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hashedPassword = crypto.scryptSync(password, salt, 64).toString("hex");
  return salt + ":" + hashedPassword;
}

function verifyPassword(password, storedPassword) {
  const passwordParts = String(storedPassword || "").split(":");

  if (passwordParts.length !== 2) {
    return false;
  }

  const salt = passwordParts[0];
  const savedHash = passwordParts[1];
  const derivedHash = crypto.scryptSync(password, salt, 64).toString("hex");
  const savedHashBuffer = Buffer.from(savedHash, "hex");
  const derivedHashBuffer = Buffer.from(derivedHash, "hex");

  if (savedHashBuffer.length !== derivedHashBuffer.length) {
    return false;
  }
 
  return crypto.timingSafeEqual(
    savedHashBuffer,
    derivedHashBuffer
  );
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function deleteExpiredPasswordResetTokens() {
  db.prepare("DELETE FROM password_resets WHERE expires_at <= ?").run(
    new Date().toISOString()
  );
}

function isPasswordResetEmailConfigured() {
  return Boolean(resend && passwordResetSenderEmail);
}

async function sendPasswordResetEmail(email, resetLink, expiresAt) {
  const expirationDate = new Date(expiresAt).toLocaleString();

  // Keep the email content simple and easy to change for beginners.
  const emailText =
    "You asked to reset your password for the todo app.\n\n" +
    "Open this link to choose a new password:\n" +
    resetLink +
    "\n\n" +
    "This link expires at " +
    expirationDate +
    ".\n\n" +
    "If you did not request this, you can ignore this email.";

  const emailHtml =
    "<p>You asked to reset your password for the todo app.</p>" +
    '<p><a href="' +
    resetLink +
    '">Click here to reset your password</a></p>' +
    "<p>This link expires at " +
    expirationDate +
    ".</p>" +
    "<p>If you did not request this, you can ignore this email.</p>";

  await resend.emails.send({
    from: passwordResetSenderEmail,
    to: email,
    subject: "Reset your todo app password",
    text: emailText,
    html: emailHtml,
  });
}

function buildPasswordResetLink(resetToken) {
  return appBaseUrl + "/?resetToken=" + encodeURIComponent(resetToken);
}
