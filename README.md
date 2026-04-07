# Simple To-Do List App With User Accounts

This version of the app adds:

- user registration
- user login
- password hashing
- logout
- per-user task privacy
- SQLite storage for both users and tasks

The app is still intentionally beginner-friendly:
plain HTML, CSS, JavaScript, Express, and SQLite.

## How It Works

### Users

Users are stored in SQLite in a `users` table with:

- `id`
- `username`
- `password`

The `password` column does **not** store the plain password.
It stores a secure salted hash created with Node.js `crypto.scryptSync()`.

### Tasks

Tasks are still stored in SQLite, but now each task belongs to one user.

The `tasks` table now includes:

- `id`
- `userId`
- `text`
- `category`
- `priority`
- `dueDate`
- `completed`
- `createdAt`

When a logged-in user loads tasks, the backend only returns rows where:

```sql
userId = currentLoggedInUserId
```

That means Alice cannot see Bob's tasks, and Bob cannot see Alice's tasks.

### Sessions

When a user logs in or registers, the server creates a session ID and sends it back in an HTTP-only cookie.

For this beginner project:

- users are saved permanently in SQLite
- tasks are saved permanently in SQLite
- sessions are stored in server memory

So if you restart the server, users and tasks stay saved, but users need to log in again.

## What Changed In Each File

### `server.js`

This file changed the most.

- Added a `users` table in SQLite.
- Updated the `tasks` table so each task has a `userId`.
- Added a small database migration so older task tables get a new `userId` column.
- Added `POST /auth/register`.
- Added `POST /auth/login`.
- Added `GET /auth/me`.
- Added `POST /auth/logout`.
- Added password hashing with Node's built-in `crypto` module using `scrypt`.
- Added simple cookie-based sessions.
- Added `requireAuth()` so task routes only work for logged-in users.
- Updated all task queries so they only read, update, and delete tasks for the current user.
- Kept comments simple so the flow is easy to follow.

### `index.html`

- Added a login/register card at the top of the page.
- Added buttons to switch between login mode and register mode.
- Added username and password fields.
- Added a logout button.
- Wrapped the task UI in a separate section that only shows after login.
- Kept the frontend layout simple and clean.

### `script.js`

- Added authentication state with `currentUser`.
- Added `checkSession()` so the page can detect whether the user is already logged in.
- Added login and registration requests with `fetch()`.
- Added logout handling.
- Added `showAuthSection()` and `showTodoSection()` to switch the visible UI.
- Updated task loading so tasks only load after a user is authenticated.
- Added automatic handling for `401 Unauthorized` responses.
- Kept the task features:
  add, edit, complete, filter, delete, and clear completed.

### `style.css`

- Added styles for the new auth card.
- Added styles for the login/register toggle buttons.
- Added styles for the session bar and logout button.
- Kept the original simple card layout and color palette.
- Made sure the page still works on smaller screens.

### `README.md`

- Rewritten to explain the new authentication system.
- Added a file-by-file change summary.
- Added updated run instructions.
- Added step-by-step testing instructions.

### `todo.db`

- Still stores the app data in SQLite.
- Now stores both users and tasks.
- Existing old tasks without a `userId` will stay in the database, but they are not shown to logged-in users because they are not linked to an account.

### `package.json`

- No new package was needed for password hashing because the app uses Node's built-in `crypto` module.
- The app still starts with:

```bash
npm start
```

## Database Tables

### `users`

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
)
```

### `tasks`

```sql
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
```

## Step By Step: Run The App

### 1. Open the project folder

```bash
cd ~/todo-app
```

If your folder is somewhere else, use that path instead.

### 2. Install dependencies

```bash
npm install
```

### 3. Start the server

```bash
npm start
```

You should see output like:

```text
Server running at http://localhost:3000
Using SQLite database at /full/path/to/todo.db
```

### 4. Open the app in your browser

Go to:

```text
http://localhost:3000
```

### 5. Register a new account

1. Click `Register`.
2. Enter a username.
3. Enter a password with at least 8 characters.
4. Click `Create Account`.

After registration, the app logs you in automatically.

### 6. Add a few tasks

1. Enter a task.
2. Optionally choose a category, priority, and due date.
3. Click `Add Task`.

### 7. Log out

Click `Logout`.

### 8. Log in again

1. Click `Login`.
2. Enter the same username and password.
3. Click `Login`.

Your tasks should still be there because they are saved in SQLite.

### 9. Stop the server

Press:

```bash
Ctrl + C
```

### 10. Start it again later

```bash
npm start
```

Users and tasks remain saved in `todo.db`.
Sessions do not remain saved, so users log in again after a restart.

## Step By Step: Test Everything

Use these manual tests in the browser.

### Test 1: Registration works

1. Open the app.
2. Click `Register`.
3. Create a new account.
4. Confirm that the task area appears after registration.

Expected result:
the account is created and you are logged in.

### Test 2: Login works

1. Click `Logout`.
2. Switch to `Login`.
3. Enter the same username and password.
4. Click `Login`.

Expected result:
you return to your task list.

### Test 3: Password rules work

1. Click `Register`.
2. Try a password shorter than 8 characters.

Expected result:
the app shows an error and does not create the account.

### Test 4: Duplicate usernames are blocked

1. Try registering the same username twice.

Expected result:
the app shows a message that the username is already taken.

### Test 5: Each user only sees their own tasks

1. Register user A and create tasks.
2. Log out.
3. Register user B.
4. Check the task list.

Expected result:
user B should not see user A's tasks.

### Test 6: Task features still work

While logged in:

1. Add a task.
2. Edit a task.
3. Mark a task complete.
4. Filter by `All`, `Active`, and `Completed`.
5. Delete a task.
6. Use `Clear Completed`.

Expected result:
all task actions still work as before, but only for the logged-in user.

### Test 7: Logout blocks task access

1. Log out.
2. Try to use the task section again.

Expected result:
the app returns to the login/register screen and requires login again.

### Test 8: Data survives a server restart

1. Create an account and add tasks.
2. Stop the server.
3. Start the server again.
4. Log in again.

Expected result:
the account and tasks are still saved.

## Quick Backend Route Summary

### Auth routes

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

### Task routes

- `GET /tasks`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`

All task routes now require a logged-in user.
# todo-app
