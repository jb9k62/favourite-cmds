# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal configuration repository containing a command-line tool for searching and executing favorite commands. The main component is `fav.mjs`, a CLI tool that provides fuzzy search capabilities for command history using fzf integration.

## Architecture

- **fav.mjs**: Main CLI script using zx (Google's shell scripting library)
  - Provides fuzzy search interface for favorite commands
  - Integrates with fzf for interactive selection
  - Supports multiple search modes (name, description, all fields)
  - Includes zsh readline integration for command insertion
  - Reads command data from `history_fav.json`

- **history_fav.json**: JSON file containing favorite commands with structure:
  ```json
  {
    "commands": [
      {
        "name": "command-name",
        "description": "Human readable description",
        "command": "actual command to execute"
      }
    ]
  }
  ```

## Dependencies

- **zx**: Shell scripting library for JavaScript/Node.js
- **fzf**: Required external dependency for fuzzy finding (must be installed separately)

## Running the Tool

```bash
# Basic usage
./fav.mjs

# Search with specific term
./fav.mjs docker

# Search modes
./fav.mjs -n docker          # Search names only
./fav.mjs -d clean           # Search descriptions only  
./fav.mjs -a git             # Search both fields

# Help
./fav.mjs -h
```

## Development Notes

- The tool is designed for zsh integration and will output `print -z` commands when in a zsh environment
- Error handling includes validation of JSON structure and fzf availability
- fzf configuration includes custom colors, key bindings, and preview windows for optimal UX
- Command escaping is handled for safe shell execution