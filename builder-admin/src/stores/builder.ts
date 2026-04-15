import { createStore } from 'solid-js/store';
import type { PageData, Section } from '../shared/types';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

const defaultPage: PageData = {
  slug: 'home',
  title: 'Home',
  seo: { title: 'My Site', description: '' },
  sections: [],
};

const [state, setState] = createStore<{
  page: PageData;
  selectedSectionId: string | null;
  isDirty: boolean;
  schemas: Record<string, unknown>;
}>({
  page: defaultPage,
  selectedSectionId: null,
  isDirty: false,
  schemas: {},
});

export const useStore = () => {
  const addSection = (type: string) => {
    const schema = state.schemas[type] as { settings?: Array<{ id: string; default?: unknown }> } | undefined;
    if (!schema) return;

    const props: Record<string, unknown> = {};
    (schema.settings || []).forEach((setting) => {
      props[setting.id] = setting.default;
    });
    
    const newSection: Section = {
      id: generateId(),
      type,
      props,
    };
    
    setState('page', 'sections', (sections) => [...sections, newSection]);
    setState('selectedSectionId', newSection.id);
    setState('isDirty', true);
  };

  const updateSection = (id: string, props: Record<string, unknown>) => {
    setState('page', 'sections', (s) => s.id === id, 'props', (p) => ({ ...p, ...props }));
    setState('isDirty', true);
  };

  const deleteSection = (id: string) => {
    setState('page', 'sections', (sections) => sections.filter((s) => s.id !== id));
    if (state.selectedSectionId === id) {
      setState('selectedSectionId', null);
    }
    setState('isDirty', true);
  };

  const selectSection = (id: string | null) => {
    setState('selectedSectionId', id);
  };

  const moveSection = (fromIndex: number, toIndex: number) => {
    const sections = [...state.page.sections];
    const [removed] = sections.splice(fromIndex, 1);
    sections.splice(toIndex, 0, removed);
    setState('page', 'sections', sections);
    setState('isDirty', true);
  };

  const duplicateSection = (id: string) => {
    const section = state.page.sections.find((s) => s.id === id);
    if (!section) return;
    
    const newSection: Section = {
      id: generateId(),
      type: section.type,
      props: { ...section.props },
    };
    
    const index = state.page.sections.findIndex((s) => s.id === id);
    const sections = [...state.page.sections];
    sections.splice(index + 1, 0, newSection);
    setState('page', 'sections', sections);
    setState('selectedSectionId', newSection.id);
    setState('isDirty', true);
  };

  const savePage = async () => {
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.page),
    });
    if (response.ok) {
      setState('isDirty', false);
    }
  };

  const loadPage = async (slug: string) => {
    const response = await fetch(`/api/pages/${slug}`);
    if (response.ok) {
      const page = await response.json();
      setState('page', page);
      setState('isDirty', false);
    }
  };

  const rebuildSite = async () => {
    const response = await fetch('/api/rebuild', { method: 'POST' });
    return response.ok;
  };

  const loadSchemas = async () => {
    const response = await fetch('/api/schemas');
    if (response.ok) {
      const schemas = await response.json();
      setState('schemas', schemas);
    }
  };

  const initPage = async () => {
    await loadPage('home');
    await loadSchemas();
  };

  return {
    state,
    addSection,
    updateSection,
    deleteSection,
    selectSection,
    moveSection,
    duplicateSection,
    savePage,
    loadPage,
    rebuildSite,
    initPage,
    loadSchemas,
  };
};