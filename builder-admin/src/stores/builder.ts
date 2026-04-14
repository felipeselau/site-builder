import { createStore } from 'solid-js/store';
import type { PageData, Section } from '../../shared/types';
import { blockRegistry } from '../../shared/block-registry';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

const defaultPage: PageData = {
  slug: 'home',
  title: 'Home',
  seo: { title: 'My Site', description: '' },
  sections: [
    {
      id: '1',
      type: 'hero',
      props: { ...blockRegistry.hero.defaultProps },
    },
  ],
};

const [state, setState] = createStore<{
  page: PageData;
  selectedSectionId: string | null;
  isDirty: boolean;
}>({
  page: defaultPage,
  selectedSectionId: null,
  isDirty: false,
});

export const useStore = () => {
  const addSection = (type: string) => {
    const block = blockRegistry[type];
    if (!block) return;
    
    const newSection: Section = {
      id: generateId(),
      type,
      props: { ...block.defaultProps },
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

  const initPage = async () => {
    await loadPage('home');
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
  };
};