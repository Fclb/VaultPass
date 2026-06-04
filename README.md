# VaultPass API 🔐

A secure backend for managing private notes and team access, built with Node.js, Express.js, and MongoDB.

---

## Stack

- **Node.js** + **Express.js** — server & routing
- **MongoDB** + **Mongoose** — database & ODM
- **bcryptjs** — password hashing
- **jsonwebtoken** — JWT auth
- **nodemailer** — email (OTP delivery)
- **dotenv** — environment variables
- **morgan** — HTTP request logging

---

## Project Structure

```
vaultpass/
├── app.js
├── .env.example
└── src/
    ├── config/
    │   └── db.js
    ├── controllers/
    │   ├── user.controllers.js
    │   ├── moderator.controllers.js
    │   └── admin.controllers.js
    ├── middleware/
    │   ├── errorHandler.js
    │   └── restrictTo.js
    ├── models/
    │   ├── user.models.js
    │   └── activityLog.models.js
    ├── routes/
    │   └── index.routes.js
    └── utils/
        ├── email.js
        ├── isAuthentication.js
        └── activityLogger.js
```

---

## Setup

```bash
npm install express mongoose bcryptjs jsonwebtoken nodemailer dotenv morgan
cp .env.example .env
# Fill in your values in .env
node app.js
```

---

## API Endpoints

### Public
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/public/message` | Open to everyone |

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/signin` | Login (returns JWT) |
| PATCH | `/api/auth/verify-email` | Verify OTP |
| POST | `/api/auth/resend-otp` | Resend OTP |

### User (requires JWT)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/user/profile` | Get own profile |

### Moderator (moderator + admin)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/moderator/reports` | View activity logs |

### Admin only
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/users` | List all users |
| DELETE | `/api/admin/user/:id` | Delete a user (not self) |
| POST | `/api/admin/promote/:id` | Promote user (not another admin) |

---

## Database Design

### `users` collection
| Field | Type | Why |
|-------|------|-----|
| `fullName` | String | User identity |
| `email` | String, unique | Login credential, contact |
| `password` | String (hashed) | Authentication |
| `role` | Enum | Access control |
| `isVerified` | Boolean | Blocks login until email confirmed |
| `otp` / `otpExpiry` | String / Date | Email verification |
| `failedLoginAttempts` | Number | Track brute force attempts |
| `firstFailedLoginAt` | Date | Define the 10-minute rolling window |
| `lockedUntil` | Date | Account lock expiry timestamp |

### `activitylogs` collection
| Field | Type | Why |
|-------|------|-----|
| `action` | Enum | Categorizes the type of event |
| `user` | String | Who was involved (email) |
| `performedBy` | ObjectId ref | Admin/mod who acted |
| `ipAddress` | String | Forensic trail |
| `details` | String | Human-readable context |
| `timestamp` | Date | When it happened |

---

## Account Locking Logic

- **5 failed logins** within a **10-minute window** → locked for **15 minutes**
- The window resets if the first failure was >10 minutes ago
- Successful login clears all failure tracking
- Locked accounts see a countdown message

---

## Extra Challenge Answers

### Q1 — Why is storing plain passwords dangerous?

Plain passwords stored in a database can be read directly if the database is ever breached (SQL injection, misconfigured access, insider threat, leaked backups). Even a small app is a target — attackers use automated tools that constantly scan for exposed databases. Hashing with bcrypt means even if attackers get the database, they cannot reverse the hash to get real passwords. The salt in bcrypt also prevents rainbow table attacks where pre-computed hash lists are used to crack common passwords.

### Q2 — Authentication vs Authorization

**Authentication** is *who you are* — proving your identity.  
Example: Entering your username and password to sign in to your bank.

**Authorization** is *what you're allowed to do* — checking your permissions after identity is confirmed.  
Example: Even after signing into the bank, a regular customer cannot access the admin panel. A bank teller can view accounts but cannot approve loans.

In this API: `isAuthentication` middleware handles authentication (verifying the JWT). `restrictTo` middleware handles authorization (checking the role).

### Q3 — Why JWT expiration matters

If tokens never expire, a stolen token gives an attacker **permanent access** with no way to revoke it — not even a password change would help because JWTs are stateless. With expiry set to 1 hour, the damage window is bounded. Even if a hacker captures a token, it becomes useless after expiry. Tokens also accumulate over time if they never expire — old sessions from devices a user no longer uses remain active indefinitely.

### Q4 — Hacker has a valid JWT. Three mitigations:

1. **Short expiry + refresh token rotation** — 15-minute access tokens expire fast. Refresh tokens are stored in the DB and can be revoked immediately if compromise is detected.
2. **Token blacklisting** — store invalidated tokens (on logout or detected abuse) in Redis or MongoDB. Every request checks the blacklist before allowing access.
3. **IP and User-Agent binding** — embed the user's IP and browser fingerprint in the token at login. If a request comes with a valid token but different IP/agent, reject it and force re-authentication.

### Q5 — Why logging systems are sensitive infrastructure

Logs contain IP addresses, user identifiers, access patterns, and timing data. An attacker who can **write** to your logs can cover their tracks or inject false entries. An attacker who can **read** your logs gains intelligence: they can see which accounts exist, which routes are being probed, and what security mechanisms are in place. Logs must be write-protected, stored separately from the application, and access-controlled. A compromised logging system can both hide an attack and become the source of a new one.
