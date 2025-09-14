# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal configuration repository containing a command-line tool for searching and executing favorite commands. The main component is `fav.mjs`, a CLI tool that provides fuzzy search capabilities for command favorites using fzf integration.

## Architecture

- **fav.mjs**: Main CLI script using zx (Google's shell scripting library)
  - Provides fuzzy search interface for favorite commands
  - Integrates with fzf for interactive selection
  - Supports multiple search modes: name-only (default), description-only, or both fields
  - Includes comprehensive zsh readline integration for command insertion
  - Reads command data from `history_fav.json`
  - Features advanced fzf configuration with custom colors, key bindings, and preview windows

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

- **package.json**: Defines zx dependency (v8.8.1)

## Dependencies

- **zx**: Shell scripting library for JavaScript/Node.js (v8.8.1)
- **fzf**: Required external dependency for fuzzy finding (must be installed separately)
- **Node.js**: Required runtime environment

## Running the Tool

```bash
# Basic usage (interactive search)
./fav.mjs

# Search with specific term
./fav.mjs docker

# Search modes
./fav.mjs -n docker          # Search names only (default behavior)
./fav.mjs -d clean           # Search descriptions only
./fav.mjs -a git             # Search both names and descriptions

# Help
./fav.mjs -h
```

## ZSH Integration

The tool is designed to integrate seamlessly with zsh's readline functionality. The script outputs the selected command to stdout (line 190 in fav.mjs), which can be captured and inserted into the zsh command line buffer using `print -z`.

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

- Default search mode is name-only (not all fields as previously documented)
- Comprehensive error handling includes JSON structure validation and fzf availability checks
- Advanced fzf configuration includes:
  - Custom Solarized-inspired color scheme
  - Preview window showing full command
  - Custom key bindings (Ctrl+U/D for preview scrolling)
  - Rounded borders and inline info display
- Command parsing uses pipe delimiter format: "display_text | command_to_execute"
- Safe command extraction from fzf selection output
