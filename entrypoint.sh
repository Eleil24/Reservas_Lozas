#!/bin/sh

# Wait for database to be ready
echo "Waiting for database..."
while ! nc -z postgres 5432; do
  sleep 1
done

echo "Database is ready"

# Run seed (Only if needed, better to run manually once)
# npm run db:seed

# Start the app
npm run start:prod