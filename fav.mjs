#!/usr/bin/env zx

// CLI command favorites searcher with fzf integration
// Usage: fav.mjs [-n|-d] [search_term]
//
// This tool provides fuzzy search capabilities for your command history using fzf.
// It supports searching by name (default), description, or both fields.
//
// ZSH READLINE INTEGRATION:
// This script is designed to work with zsh's readline buffer via `print -z`.
// The script outputs the selected command to stdout (line 171), which can be
// captured by a zsh function and fed to `print -z` to add it to the readline buffer.
//
// Example zsh integration in ~/.zshrc:
//   fav() {
//     local cmd=$(~/path/to/fav.mjs "$@")
//     if [[ -n "$cmd" ]]; then
//       print -z "$cmd"
//     fi
//   }
//
// The "$@" passes all arguments from the zsh function to this script, allowing
// commands like `fav docker` or `fav -d clean` to work seamlessly.
//
// This allows the selected command to appear in the zsh command line where it can
// be edited before execution, providing a seamless interactive experience.

import { readFile } from "fs/promises";
import { homedir } from "os";
import path from "path";

const FAV_FILE = path.join(homedir(), ".config/personal_cfg/history_fav.json");

// Parse command line arguments
const args = process.argv.slice(2);
let searchMode = "name"; // Default to name-only search as intended
let searchTerm = "";

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "-n" || arg === "--name") {
    searchMode = "name";
  } else if (arg === "-d" || arg === "--description") {
    searchMode = "description";
  } else if (arg === "-a" || arg === "--all") {
    searchMode = "all";
  } else if (arg === "-h" || arg === "--help") {
    console.log("Usage: fav.mjs [-n|-d|-a] [search_term]");
    console.log("  -n, --name         Search names only (default)");
    console.log("  -d, --description  Search descriptions only");
    console.log("  -a, --all          Search both names and descriptions");
    console.log("  -h, --help         Show this help message");
    console.log("");
    console.log("Examples:");
    console.log('  fav.mjs docker          # Search names for "docker"');
    console.log('  fav.mjs -d clean        # Search descriptions for "clean"');
    console.log('  fav.mjs -a git          # Search both fields for "git"');
    process.exit(0);
  } else {
    searchTerm = arg;
  }
}

// Check if required tools are available
try {
  await $`command -v fzf`;
} catch {
  console.error("Error: fzf is required but not installed");
  process.exit(1);
}

// Load favorites file
let favorites;
try {
  const fileContent = await readFile(FAV_FILE, "utf8");
  favorites = JSON.parse(fileContent);

  // Validate the structure
  if (!favorites.commands || !Array.isArray(favorites.commands)) {
    throw new Error('Invalid file format: missing or invalid "commands" array');
  }

  if (favorites.commands.length === 0) {
    console.error("No commands found in favorites file");
    process.exit(1);
  }
} catch (error) {
  console.error(`Error: Could not read favorites file at ${FAV_FILE}`);
  console.error(error.message);
  process.exit(1);
}

// Prepare fzf input based on search mode
// Each line format: "display_text |> command_to_execute"
function prepareFzfInput() {
  return favorites.commands
    .map((cmd) => {
      let displayText;
      switch (searchMode) {
        case "name":
          // Show only name, search only in name
          displayText = cmd.name;
          break;
        case "description":
          // Show description, search only in description
          displayText = cmd.description;
          break;
        case "all":
        default:
          // Show name and description, search in both
          displayText = `${cmd.name} • ${cmd.description}`;
          break;
      }
      return `${displayText} |> ${cmd.command}`;
    })
    .join("\n");
}

// Configure fzf options for optimal user experience
function getFzfOptions() {
  const baseQuery = searchTerm ? `--query="${searchTerm}"` : "";

  // fzf options explained:
  // --delimiter=' |> ' : Split on pipe delimiter
  // --with-nth=1 : Only search/display the first field (before the pipe)
  // --preview='echo {2}' : Show the command (field 2) in preview window
  // --preview-window : Configure preview window layout and behavior
  // --prompt : Custom prompt text
  // --height : Limit height to 60% of terminal
  // --layout=reverse : Put input at top (more natural)
  // --border : Add border for better visual separation
  // --info=inline : Show match info inline with input
  // --color : Custom color scheme for better readability
  // --bind : Custom key bindings for enhanced navigation
  // --header : Show helpful header text
  // --margin : Add margins for better visual appearance

  return [
    '--delimiter=" |> "',
    "--with-nth=1",
    '--preview="echo {2}"',
    '--preview-window="down:3:wrap:border"',
    '--prompt="❯ "',
    "--height=60%",
    "--layout=reverse",
    "--border=rounded",
    "--info=inline",
    '--color="border:#586e75,header:#93a1a1,gutter:#002b36,prompt:#b58900,pointer:#cb4b16,marker:#dc322f,fg+:#eee8d5,bg+:#073642,hl+:#b58900"',
    '--bind="ctrl-u:preview-page-up,ctrl-d:preview-page-down,ctrl-f:preview-page-down,ctrl-b:preview-page-up"',
    '--header="Tab: select • Enter: execute • Ctrl+C: cancel • Ctrl+U/D: scroll preview"',
    "--margin=1,2",
    baseQuery,
  ]
    .filter(Boolean)
    .join(" ");
}

// Run fzf and get selection
const fzfInput = prepareFzfInput();
let selection;

try {
  // Use echo with proper escaping - simpler and more reliable for our use case
  const result = await $`echo ${fzfInput}`.pipe($`fzf ${getFzfOptions()}`);
  selection = result.stdout.trim();
} catch (error) {
  // User cancelled (Ctrl+C) or no selection made
  if (error.exitCode === 130 || error.exitCode === 1) {
    process.exit(0);
  }

  // Unexpected error
  console.error("Error running fzf:", error.message);
  process.exit(1);
}

// Handle empty selection
if (!selection) {
  process.exit(0);
}

// Extract command from selection (everything after the last ' |> ')
const parts = selection.split(" |> ");
if (parts.length < 2) {
  console.error("Error: Invalid selection format");
  process.exit(1);
}

const command = parts[parts.length - 1].trim();
console.log(command);
