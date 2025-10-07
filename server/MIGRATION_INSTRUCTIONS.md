# Database Migration - Add Username Field

## Changes Made:
- Added `username String @unique` to User model in schema.prisma
- Username is required, unique, and immutable

## Run Migration:

```bash
cd /Users/emile/sprint100-1/server

# Generate and apply migration
npx prisma migrate dev --name add_username_to_user

# This will:
# 1. Create migration SQL file
# 2. Apply it to dev.db
# 3. Regenerate Prisma client
```

## Manual Migration (if dev database needs reset):

```bash
# Delete existing database
rm prisma/dev.db

# Create fresh database with new schema
npx prisma migrate dev --name init
```

## Username Validation Rules:
- 3-20 characters
- Alphanumeric + underscore only  
- Unique across all users
- Cannot be changed after registration

## Breaking Change:
Existing users in the database will need usernames added manually or the database should be reset for development.

