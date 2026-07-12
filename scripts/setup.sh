#!/bin/bash
echo 'Setting up project...'
npm install
# Startup docker database
docker-compose -f docker/docker-compose.yml up -d
echo 'Setup complete.'
