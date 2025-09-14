# fav - Command Favorites Tool

A fuzzy-searchable command favorites tool with zsh integration.

## Quick Start

```bash
# Interactive search
./fav.mjs

# Search with term
./fav.mjs docker

# Search modes
./fav.mjs -n docker    # names only
./fav.mjs -d clean     # descriptions only
./fav.mjs -a git       # both fields
```

## ZSH Integration

Add to `~/.zshrc`:

```bash
fav() {
  local cmd=$(~/.config/personal_cfg/fav.mjs "$@")
  if [[ -n "$cmd" ]]; then
    print -z "$cmd"
  fi
}
```

Commands appear in your shell prompt for editing before execution.

## Dependencies

- Node.js
- [zx](https://www.npmjs.com/package/zx) (installed via `npm install`)
- [fzf](https://github.com/junegunn/fzf) (install separately)

## Commands Format

Edit `history_fav.json`:

```json
{
  "commands": [
    {
      "name": "docker-clean",
      "description": "Remove all stopped containers and unused images",
      "command": "docker system prune -f"
    }
  ]
}
```