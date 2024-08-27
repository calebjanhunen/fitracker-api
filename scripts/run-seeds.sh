#!/bin/sh

GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "${GREEN}Seeding database${NC}"
for file in ../database/seeds/*.sql
do
    echo "${GREEN}Running $file${NC}"
    psql -f "$file"
done
echo "${GREEN}Seeding database complete${NC}"