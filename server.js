const crypto = require("crypto");
const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;
const databasePath = path.join(__dirname, "todo.db");
const sessionCookieName = "todo_session";

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
  const password = normalizePassword(request.body.password);

  if (username.length < 3) {
    response.status(400).json({
      error: "Username must be at least 3 characters long.",
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

  const passwordHash = hashPassword(password);
  const result = db
    .prepare(
      `
        INSERT INTO users (username, password)
        VALUES (?, ?)
      `
    )
    .run(username, passwordHash);

  const createdUser = db
    .prepare("SELECT id, username FROM users WHERE id = ?")
    .get(result.lastInsertRowid);

  createSession(response, createdUser.id);

  response.status(201).json({
    message: "Account created successfully.",
    user: createdUser,
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

app.listen(port, function () {
  console.log("Server running at http://localhost:" + port);
  console.log("Using SQLite database at " + databasePath);
});

function setupDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
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

  addUserIdColumnIfMissing();
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
    .prepare("SELECT id, username FROM users WHERE id = ?")
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
