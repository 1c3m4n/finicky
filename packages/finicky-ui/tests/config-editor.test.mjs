import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = (path) => readFileSync(resolve(root, path), "utf8");

const app = source("src/App.svelte");
const tabs = source("src/components/TabBar.svelte");
const windowGo = readFileSync(resolve(root, "../../apps/finicky/src/window/window.go"), "utf8");

assert.match(app, /import\s+ConfigEditor\s+from\s+["']\.\/pages\/ConfigEditor\.svelte["']/, "App imports the config editor page");
assert.match(app, /case\s+["']configFile["']:/, "App handles configFile messages from native code");
assert.match(app, /case\s+["']saveConfigFileResult["']:/, "App handles successful config saves");
assert.match(app, /<Route\s+path=["']\/config["']>/, "App exposes a /config route");
assert.match(app, /<ConfigEditor\s+\{configFile\}/, "App passes config file state to the editor");

assert.match(tabs, /path:\s*["']\/config["'][\s\S]*label:\s*["']Edit Config["']/, "Tab bar exposes an Edit Config tab");

assert.match(windowGo, /LoadConfigFileHandler/, "Native window has a load config handler hook");
assert.match(windowGo, /SaveConfigFileHandler/, "Native window has a save config handler hook");
assert.match(windowGo, /case\s+["']getConfigFile["']:/, "Native window handles getConfigFile messages");
assert.match(windowGo, /case\s+["']saveConfigFile["']:/, "Native window handles saveConfigFile messages");

const editor = source("src/pages/ConfigEditor.svelte");
assert.match(editor, /type:\s*["']getConfigFile["']/, "Config editor requests file contents");
assert.match(editor, /type:\s*["']saveConfigFile["']/, "Config editor saves edited contents");
assert.match(editor, /<textarea/, "Config editor provides a textarea for editing the config");
