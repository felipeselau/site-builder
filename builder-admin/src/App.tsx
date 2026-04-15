import { Component, createSignal, For, Show, onMount } from 'solid-js';
import { useStore } from './stores/builder';

const BlockPicker: Component = () => {
  const { addSection, state } = useStore();

  const getBlockNames = () => {
    const schemas = state.schemas as Record<string, { name?: string }>;
    return Object.entries(schemas).map(([key, schema]) => ({
      type: key,
      name: schema?.name || key,
    }));
  };

  return (
    <div class="sidebar">
      <h3>Add Block</h3>
      <div class="block-list">
        <For each={getBlockNames()}>
          {(block) => (
            <button
              class="block-item"
              onClick={() => addSection(block.type)}
            >
              {block.name}
            </button>
          )}
        </For>
      </div>
    </div>
  );
};

const LayersPanel: Component = () => {
  const { state, selectSection, deleteSection, duplicateSection } = useStore();

  const getSectionName = (type: string) => {
    const schemas = state.schemas as Record<string, { name?: string }>;
    return schemas[type]?.name || type;
  };

  return (
    <div class="layers-panel">
      <h3>Sections</h3>
      <div class="layers-list">
        <For each={state.page.sections}>
          {(section, index) => (
            <div
              class={`layer-item ${state.selectedSectionId === section.id ? 'selected' : ''}`}
              onClick={() => selectSection(section.id)}
            >
              <span class="layer-name">
                {getSectionName(section.type)}
              </span>
              <div class="layer-actions">
                <button onClick={(e) => { e.stopPropagation(); duplicateSection(section.id); }}>⧉</button>
                <button onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }}>×</button>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

const Inspector: Component = () => {
  const { state, updateSection } = useStore();
  const selected = () => state.page.sections.find((s) => s.id === state.selectedSectionId);
  
  const getSchemaSettings = () => {
    const section = selected();
    if (!section) return [];
    const schema = state.schemas[section.type] as { settings?: Array<{ id: string; type: string; label: string; default?: unknown; options?: Array<{ value: string; label: string }> }> } | undefined;
    return schema?.settings || [];
  };

  return (
    <div class="inspector">
      <h3>Properties</h3>
      <Show when={selected()} fallback={<p class="empty">Select a section</p>}>
        {(section) => (
          <div class="props-form">
            <For each={getSchemaSettings()}>
              {(field) => (
                <div class="prop-field">
                  <label>{field.label}</label>
                  <Show when={field.type === 'text' || field.type === 'url'}>
                    <input
                      type="text"
                      value={(section().props[field.id] as string) || (field.default as string) || ''}
                      onInput={(e) => updateSection(section().id, { [field.id]: e.currentTarget.value })}
                    />
                  </Show>
                  <Show when={field.type === 'textarea' || field.type === 'richtext'}>
                    <textarea
                      value={(section().props[field.id] as string) || (field.default as string) || ''}
                      onInput={(e) => updateSection(section().id, { [field.id]: e.currentTarget.value })}
                    />
                  </Show>
                  <Show when={field.type === 'color'}>
                    <input
                      type="color"
                      value={(section().props[field.id] as string) || (field.default as string) || '#000000'}
                      onInput={(e) => updateSection(section().id, { [field.id]: e.currentTarget.value })}
                    />
                  </Show>
                  <Show when={field.type === 'select'}>
                    <select
                      value={(section().props[field.id] as string) || (field.default as string) || ''}
                      onChange={(e) => updateSection(section().id, { [field.id]: e.currentTarget.value })}
                    >
                      <For each={field.options}>
                        {(opt) => <option value={opt.value}>{opt.label}</option>}
                      </For>
                    </select>
                  </Show>
                  <Show when={field.type === 'number' || field.type === 'range'}>
                    <input
                      type="number"
                      value={(section().props[field.id] as number) || (field.default as number) || 0}
                      onInput={(e) => updateSection(section().id, { [field.id]: parseFloat(e.currentTarget.value) })}
                    />
                  </Show>
                  <Show when={field.type === 'checkbox'}>
                    <input
                      type="checkbox"
                      checked={(section().props[field.id] as boolean) || (field.default as boolean) || false}
                      onChange={(e) => updateSection(section().id, { [field.id]: e.currentTarget.checked })}
                    />
                  </Show>
                  <Show when={field.type === 'image_picker'}>
                    <input
                      type="text"
                      value={(section().props[field.id] as string) || (field.default as string) || ''}
                      placeholder="Image URL"
                      onInput={(e) => updateSection(section().id, { [field.id]: e.currentTarget.value })}
                    />
                  </Show>
                </div>
              )}
            </For>
          </div>
        )}
      </Show>
    </div>
  );
};

const Canvas: Component = () => {
  const { state, savePage, rebuildSite, initPage } = useStore();
  const [loading, setLoading] = createSignal(false);
  const [previewKey, setPreviewKey] = createSignal(0);

  const handleSave = async () => {
    setLoading(true);
    await savePage();
    await rebuildSite();
    setPreviewKey(k => k + 1);
    setLoading(false);
  };

  onMount(() => {
    initPage();
  });

  return (
    <div class="canvas">
      <div class="canvas-header">
        <h2>{state.page.title}</h2>
        <button class="save-btn" onClick={handleSave} disabled={loading()}>
          {loading() ? 'Saving...' : 'Save'}
        </button>
      </div>
      <div class="preview-area">
        <iframe 
          src="http://localhost:3001" 
          key={previewKey()}
          class="preview-iframe"
          title="Site Preview"
        />
      </div>
    </div>
  );
};

const App: Component = () => {
  return (
    <div class="builder-app">
      <div class="sidebar-area">
        <BlockPicker />
        <LayersPanel />
      </div>
      <Canvas />
      <div class="inspector-area">
        <Inspector />
      </div>
    </div>
  );
};

export default App;