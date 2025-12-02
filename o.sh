#!/bin/bash

# Add node_modules to .gitignore
echo "node_modules/" >> .gitignore
echo "frontend/*/node_modules/" >> .gitignore
echo "backend/node_modules/" >> .gitignore

# Add .gitignore changes
git add .gitignore

# Remove all node_modules from Git index (cached)
git rm -r --cached **/node_modules 2>/dev/null || true
git rm -r --cached node_modules 2>/dev/null || true

# Re-add all files except ignored ones
git add .

# Commit the changes
git commit -m "Remove all node_modules directories and update .gitignore"

# Clean Git objects
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push to main branch
git push origin main --force

echo "All node_modules removed from Git tracking and pushed to main branch."
