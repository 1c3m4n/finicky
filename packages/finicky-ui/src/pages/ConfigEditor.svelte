<script lang="ts">
  import { onMount } from "svelte";
  import PageContainer from "../components/PageContainer.svelte";
  import type { ConfigFile } from "../types";
  import { toast } from "../lib/toast";

  export let configFile: ConfigFile = {
    path: "",
    content: "",
    exists: false,
  };

  let editorContent = "";
  let currentPath = "";
  let fileExists = false;
  let dirty = false;
  let saving = false;
  let loadedSignature = "";

  $: {
    const signature = `${configFile.path}\0${configFile.content}\0${configFile.exists}`;
    if (signature !== loadedSignature && !dirty) {
      editorContent = configFile.content;
      currentPath = configFile.path;
      fileExists = configFile.exists;
      loadedSignature = signature;
      saving = false;
    }
  }

  onMount(() => {
    window.finicky.sendMessage({ type: "getConfigFile" });
  });

  function refresh() {
    if (dirty) {
      toast.show("Unsaved changes", "warning", "Save or discard your changes before refreshing.");
      return;
    }
    window.finicky.sendMessage({ type: "getConfigFile" });
  }

  function discard() {
    editorContent = configFile.content;
    currentPath = configFile.path;
    fileExists = configFile.exists;
    dirty = false;
    saving = false;
  }

  function onEditorInput(event: Event) {
    editorContent = (event.target as HTMLTextAreaElement).value;
    dirty = editorContent !== configFile.content;
  }

  function save() {
    saving = true;
    dirty = false;
    window.finicky.sendMessage({ type: "saveConfigFile", content: editorContent });
  }
</script>

<PageContainer title="Edit Config">
  {#snippet description()}
    Edit the JavaScript or TypeScript config file Finicky loads at startup. Saving writes the file and Finicky reloads it automatically.
  {/snippet}

  <div class="editor-card">
    <div class="editor-toolbar">
      <div class="path-group">
        <span class="label">File</span>
        {#if currentPath}
          <code>{currentPath}</code>
        {:else}
          <span class="muted">Loading…</span>
        {/if}
        {#if currentPath && !fileExists}
          <span class="badge">new file</span>
        {/if}
      </div>
      <div class="actions">
        <button type="button" class="secondary" onclick={refresh}>Refresh</button>
        {#if dirty}
          <button type="button" class="secondary" onclick={discard}>Discard</button>
        {/if}
        <button type="button" class="primary" onclick={save} disabled={!currentPath || !dirty || saving}>
          {saving ? "Saving…" : "Save Config"}
        </button>
      </div>
    </div>

    {#if currentPath && !fileExists}
      <div class="notice">
        No JavaScript config exists yet. This editor will create <code>{currentPath}</code> the first time you save.
      </div>
    {/if}

    <textarea
      spellcheck="false"
      aria-label="Finicky configuration editor"
      value={editorContent}
      oninput={onEditorInput}
    ></textarea>
  </div>
</PageContainer>

<style>
  .editor-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: calc(100vh - 170px);
    min-height: 420px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    padding: 14px;
  }

  .editor-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .path-group {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    font-size: 0.82em;
  }

  .label {
    color: var(--text-primary);
    font-weight: 600;
  }

  code {
    max-width: 360px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-primary);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 3px 7px;
  }

  .muted {
    color: var(--text-secondary);
  }

  .badge {
    color: var(--accent-color);
    border: 1px solid color-mix(in srgb, var(--accent-color) 45%, transparent);
    border-radius: 999px;
    padding: 2px 7px;
    font-size: 0.75em;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  button {
    border: 1px solid var(--border-color);
    border-radius: 7px;
    padding: 7px 12px;
    font: inherit;
    cursor: pointer;
    color: var(--text-primary);
    background: var(--button-bg);
  }

  button:hover:not(:disabled) {
    background: var(--button-hover);
  }

  button:disabled {
    opacity: 0.45;
    cursor: default;
  }

  .primary {
    color: white;
    background: var(--accent-color);
    border-color: var(--accent-color);
  }

  .primary:hover:not(:disabled) {
    filter: brightness(1.05);
  }

  .secondary {
    background: transparent;
  }

  .notice {
    color: var(--text-secondary);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 0.85em;
  }

  textarea {
    flex: 1;
    width: 100%;
    resize: none;
    box-sizing: border-box;
    color: var(--text-primary);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 14px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    font-size: 0.9em;
    line-height: 1.5;
    tab-size: 2;
    outline: none;
  }

  textarea:focus {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-color) 18%, transparent);
  }
</style>
