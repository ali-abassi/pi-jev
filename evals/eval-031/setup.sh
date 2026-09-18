#!/bin/sh
cd "$1" || exit 1
export GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@t GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@t
git branch -qM main
echo "main work" > c2.txt
git add -A && git commit -qm "main progress"
git checkout -qb feature
echo "feature work" > f1.txt
git add -A && git commit -qm "feature work"
git checkout -q main
