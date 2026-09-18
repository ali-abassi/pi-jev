# Shared oracle bits. jb 0/1 -> false/true
jb() { [ "$1" = 1 ] && echo true || echo false; }
