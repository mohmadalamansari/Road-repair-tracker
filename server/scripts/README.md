# CivicPulse Admin Scripts

This directory contains utility scripts for the CivicPulse application.

## Create Admin User

There are two scripts for creating admin users:

### Interactive Script

This script will prompt you for input:

```bash
cd server
node scripts/createAdminUser.js
```

Follow the prompts to enter admin name, email, and password.

### Non-Interactive Script

For automated setups or when you don't want interactive prompts:

```bash
cd server
node scripts/createAdminUserNonInteractive.js "Admin Name" admin@example.com password123
```

Arguments:

1. Admin Name (use quotes if it contains spaces)
2. Email
3. Password (must be at least 6 characters)

## Features

- Creates a new admin user if email doesn't exist
- Updates an existing user to admin role if the email exists but user isn't an admin
- Performs validation on inputs
- Password must be at least 6 characters long
- Can be used for initial system setup or recovering admin access

## Troubleshooting

If you encounter errors:

1. Make sure MongoDB is running
2. Check your .env file has the correct MONGODB_URI
3. Ensure your connection to the database is working
