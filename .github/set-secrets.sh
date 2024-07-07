#!/bin/bash

# 1. brew install gh
# 2. gh auth login
# 3. USERNAME=your_username GH_TOKEN=your_gh_token NPM_TOKEN=your_npm_token bash ./set-secrets.sh

GH_TOKEN=${GH_TOKEN}
USERNAME=${USERNAME}
NPM_TOKEN=${NPM_TOKEN}

if [ -z "$USERNAME" ] || [ -z "$NPM_TOKEN" ] || [ -z "$GH_TOKEN" ]; then
  echo "Error: USERNAME, NPM_TOKEN, and GH_TOKEN environment variables must be set."
  exit 1
fi

echo $GH_TOKEN | gh auth login --with-token

# get all repositories for the user
REPOS=$(gh repo list $USERNAME --json name -q '.[].name')

for REPO in $REPOS; do
  echo "Setting secrets for repository: $REPO"
  gh secret set NPM_TOKEN --body "$NPM_TOKEN" --repo "$USERNAME/$REPO" || true
  gh secret set GH_TOKEN --body "$GH_TOKEN" --repo "$USERNAME/$REPO" || true
done