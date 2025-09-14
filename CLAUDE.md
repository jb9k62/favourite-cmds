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

## ZSH Integration

The tool is designed to integrate seamlessly with zsh's readline functionality. The script outputs the selected command to stdout, which can be captured and inserted into the zsh command line buffer using `print -z`.

### Setup

Add this function to your `~/.zshrc`:

```bash
fav() {
  local cmd=$(~/.config/personal_cfg/fav.mjs "$@")
  if [[ -n "$cmd" ]]; then
    print -z "$cmd"
  fi
}
```

### How it Works

1. **Command Selection**: The `fav.mjs` script displays an fzf interface for selecting commands
2. **stdout Output**: The selected command is output to stdout (no execution)
3. **ZSH Capture**: The zsh function captures this output using command substitution `$()`
4. **Readline Buffer**: `print -z` adds the command to zsh's readline buffer
5. **User Control**: The command appears on the command line where it can be edited before execution

The `"$@"` in the zsh function passes all arguments to the script, enabling usage like:

- `fav` - Interactive search
- `fav docker` - Search with initial query
- `fav -d clean` - Search descriptions for "clean"

## Development Notes

- The tool is designed for zsh integration and will output `print -z` commands when in a zsh environment
- Error handling includes validation of JSON structure and fzf availability
- fzf configuration includes custom colors, key bindings, and preview windows for optimal UX
- Command escaping is handled for safe shell execution
