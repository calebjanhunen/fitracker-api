#!/bin/sh

MAGENTA='\033[0;35m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo "${MAGENTA}Starting to seed database${NC}"

echo "${YELLOW}Seeding ${GREEN}user${YELLOW} database${NC}"
psql -f "/database/seeds/user_data.sql"
echo "Seeding user database"
psql -f "/database/seeds/user_data.sql"

echo "${YELLOW}Seeding ${GREEN}exercise${YELLOW} database${NC}"
psql -f "/database/seeds/exercise_data.sql"

echo "${YELLOW}Seeding ${GREEN}workout${YELLOW} database${NC}"
psql -f "/database/seeds/workout_data.sql"

echo "${MAGENTA}Seeding database complete${NC}"