export interface BlockField {
  key: string;
  type: "text" | "textarea" | "image" | "select" | "number" | "color" | "boolean";
  label: string;
  default?: string | number | boolean;
  options?: { value: string; label: string }[];
  required?: boolean;
}

export interface BlockDefinition {
  label: string;
  icon?: string;
  fields: BlockField[];
  defaultProps: Record<string, unknown>;
}

export interface BlockRegistry {
  [key: string]: BlockDefinition;
}

export interface Block {
  type: string;
  props: Record<string, unknown>;
}

export interface Section extends Block {
  id: string;
}

export interface PageSeo {
  title?: string;
  description?: string;
  image?: string;
}

export interface PageData {
  slug: string;
  title: string;
  seo?: PageSeo;
  sections: Section[];
}