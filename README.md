# Simple To-Do List App With User Accounts And Password Reset

This project is a beginner-friendly to-do app built with:

- HTML
- CSS
- vanilla JavaScript
- Express
- SQLite
- Resend for password reset emails

It supports:

- user registration
- login/logout
- per-user task privacy
- password hashing with `crypto.scryptSync()`
- password reset tokens with expiration
- email-based password reset requests
- a simple frontend flow for resetting a password

## How Password Reset Works

1. A user enters their email in the `Forgot password?` form.
2. The app sends that email to `POST /auth/forgot-password`.
3. The server creates a secure random token with `crypto.randomBytes()`.
4. The server stores only a hashed version of that token in the `password_resets` table.
5. The server builds a reset link like `https://your-app-url/?resetToken=...`.
6. The server sends that link by email through Resend.
7. The user opens the link from the email.
8. The frontend reads `?resetToken=...` from the URL and fills in the reset form.
9. The app sends the token and the new password to `POST /auth/reset-password`.
10. The server checks the token, checks the expiration time, updates the password, and deletes the token.

## Environment Variables

The password reset email feature uses these environment variables:

- `RESEND_API_KEY`
  Your Resend API key.
- `PASSWORD_RESET_FROM_EMAIL`
  The sender email address Resend should use, for example `onboarding@resend.dev` while testing.
- `APP_BASE_URL`
  The public URL of your app. For local development use `http://localhost:3000`. For Render use your Render URL.

## Local Development Setup

### 1. Install dependencies

```bash
cd ~/todo-app
npm install
```

### 2. Create your local environment file

Copy `.env.example` to `.env` and fill in your real values:

```bash
cp .env.example .env
```

Example `.env` values:

```bash
RESEND_API_KEY="re_your_real_api_key"
PASSWORD_RESET_FROM_EMAIL="onboarding@resend.dev"
APP_BASE_URL="http://localhost:3000"
```

Notes:

- `onboarding@resend.dev` is useful for first tests in Resend.
- If you use your own domain in Resend, replace the sender email with your verified address.
- The app loads `.env` automatically through `dotenv`.
- On Render, environment variables should still be configured in the Render dashboard instead of committing a `.env` file.

### 3. Start the server

```bash
npm start
```

You should see logs similar to:

```text
Server running at http://localhost:3000
Using SQLite database at /full/path/to/todo.db
Password reset links use base URL: http://localhost:3000
```

### 4. Open the app

Visit:

```text
http://localhost:3000
```

## Render Deployment Setup

In your Render service:

1. Open the service dashboard.
2. Go to `Environment`.
3. Add these variables:
   `RESEND_API_KEY`
   Your real Resend API key.
   `PASSWORD_RESET_FROM_EMAIL`
   Your verified sender address in Resend.
   `APP_BASE_URL`
   Your public Render URL, for example `https://todo-app-example.onrender.com`
4. Save the changes.
5. Redeploy the service.

Important:

- `APP_BASE_URL` should match the real public URL users open in the browser.
- If you leave `APP_BASE_URL` unset on Render, reset emails may contain a localhost link, which is wrong for production.
- Your sender email must be allowed by your Resend account.

## What Changed In Each File

### `server.js`

- Added the `resend` import and created a small Resend client from `RESEND_API_KEY`.
- Kept the existing password reset flow:
  token generation,
  token hashing,
  token storage,
  expiration checking,
  and password update logic all stay the same.
- Replaced the password reset console log with a real `sendPasswordResetEmail()` helper.
- Added `PASSWORD_RESET_FROM_EMAIL` and `APP_BASE_URL` support through environment variables.
- Added `buildPasswordResetLink()` so the email link uses the correct local or Render URL.
- Added a configuration check so the server gives a clear error if email variables are missing.
- Added a small cleanup step that deletes the saved reset token if email sending fails.

### `script.js`

- Updated the success message after `Forgot password?`.
- The frontend now tells the user that a password reset email was sent instead of telling them to check the server console.
- The reset forms and reset-token URL handling stay the same.

### `package.json`

- Added the `resend` dependency.

### `package-lock.json`

- Updated automatically when `resend` was installed.

### `README.md`

- Replaced the old console-log instructions with real email setup instructions.
- Added local setup steps for environment variables.
- Added Render deployment setup instructions.
- Added exact end-to-end testing steps for the full email-based reset flow.

## Database Tables

### `users`

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT
)
```

The app also creates a unique index for non-null emails on startup.

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

### `password_resets`

```sql
CREATE TABLE IF NOT EXISTS password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

The `token` column stores a hashed token, not the plain token from the email link.

## Auth Routes

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

## Task Routes

- `GET /tasks`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`

## Exactly How To Test The Full Password Reset Flow

### 1. Start with working email configuration

Before testing, make sure the server was started with:

```bash
export RESEND_API_KEY="re_your_real_api_key"
export PASSWORD_RESET_FROM_EMAIL="onboarding@resend.dev"
export APP_BASE_URL="http://localhost:3000"
npm start
```

### 2. Register a user

1. Open `http://localhost:3000`
2. Click `Register`
3. Enter:
   username: `testuser`
   email: an email inbox you can actually open
   password: `password123`
4. Click `Create Account`
5. Confirm that the app logs you in

### 3. Log out

1. Click `Logout`
2. Confirm you are back on the auth screen

### 4. Request the reset email

1. Click `Forgot password?`
2. Enter the same email you used for registration
3. Click `Send Reset Link`
4. Confirm the page shows the generic success message

Expected result:

- the browser should not show the reset link directly
- the email should arrive in the inbox for that address

### 5. Open the reset email

1. Open the inbox for the email address you used
2. Find the message with subject `Reset your todo app password`
3. Click the reset link inside the email

Expected result:

- the browser opens your app
- the URL contains `?resetToken=...`
- the password reset panel is open
- the token field is already filled in

### 6. Submit the new password

1. In the reset form, enter a new password such as `newpassword123`
2. Click `Reset Password`

Expected result:

- the app shows a success message
- the app returns to login mode

### 7. Log in with the new password

1. Enter the same username as before
2. Enter the new password
3. Click `Login`

Expected result:

- login works

### 8. Confirm the old password no longer works

1. Click `Logout`
2. Try to log in with the old password `password123`

Expected result:

- login fails with an authentication error

### 9. Confirm the reset token cannot be reused

1. Open the same reset link from the email again
2. Try to reset the password a second time

Expected result:

- the app shows an error saying the token is invalid or expired

## Extra Manual Checks

### Missing email configuration

1. Stop the server
2. Start it without `RESEND_API_KEY` or without `PASSWORD_RESET_FROM_EMAIL`
3. Request a password reset

Expected result:

- the server returns a clear error that email sending is not configured

### Invalid email on registration

1. Click `Register`
2. Enter an invalid email such as `test`
3. Submit the form

Expected result:

- the server rejects the request with an error

### Duplicate email

1. Register one account with an email
2. Try to register another account with the same email

Expected result:

- the server rejects the second registration

### Expired token

The app creates reset tokens that last for 1 hour.
To test expiration manually, wait until the token expires or temporarily shorten `passwordResetLifetimeMs` in `server.js`.
