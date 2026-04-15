export interface SchemaField {
  id: string;
  type: "text" | "textarea" | "richtext" | "image_picker" | "image_url" | "select" | "number" | "range" | "color" | "checkbox" | "radio" | "url" | "link" | "product" | "collection" | "article" | "page";
  label: string;
  default?: string | number | boolean;
  info?: string;
  required?: boolean;
  visible?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
}

export interface BlockSchema {
  name: string;
  tag_name?: string;
  class?: string;
  settings: SchemaField[];
  blocks?: {
    id: string;
    name: string;
    type: string;
    settings: SchemaField[];
  }[];
  max_blocks?: number;
  presets?: {
    name: string;
    blocks?: { type: string }[];
    settings?: Record<string, unknown>;
  }[];
}

export interface BlockSchemas {
  [key: string]: BlockSchema;
}

export const blockSchemas: BlockSchemas = {
  hero: {
    name: "Hero",
    tag_name: "section",
    class: "hero",
    settings: [
      {
        id: "title",
        type: "text",
        label: "Title",
        default: "Welcome to Your Site",
        placeholder: "Enter hero title"
      },
      {
        id: "subtitle",
        type: "textarea",
        label: "Subtitle",
        default: "Build amazing websites with our site builder",
        placeholder: "Enter subtitle text"
      },
      {
        id: "backgroundImage",
        type: "image_picker",
        label: "Background Image",
        info: "Recommended size: 1920x1080px"
      },
      {
        id: "backgroundColor",
        type: "color",
        label: "Background Color",
        default: "#1a1a2e"
      },
      {
        id: "textColor",
        type: "color",
        label: "Text Color",
        default: "#ffffff"
      },
      {
        id: "ctaText",
        type: "text",
        label: "CTA Button Text",
        default: "Get Started",
        placeholder: "Button text"
      },
      {
        id: "ctaLink",
        type: "url",
        label: "CTA Link",
        default: "#",
        placeholder: "https://"
      },
      {
        id: "ctaStyle",
        type: "select",
        label: "CTA Style",
        default: "primary",
        options: [
          { value: "primary", label: "Primary" },
          { value: "secondary", label: "Secondary" },
          { value: "outline", label: "Outline" }
        ]
      }
    ]
  },
  content: {
    name: "Content",
    tag_name: "section",
    class: "content",
    settings: [
      {
        id: "heading",
        type: "text",
        label: "Heading",
        default: "About Us",
        placeholder: "Enter heading"
      },
      {
        id: "content",
        type: "richtext",
        label: "Content",
        default: "Add your content here. Tell your story, share your vision.",
        placeholder: "Enter content"
      },
      {
        id: "alignment",
        type: "select",
        label: "Alignment",
        default: "left",
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" }
        ]
      },
      {
        id: "contentWidth",
        type: "select",
        label: "Content Width",
        default: "medium",
        options: [
          { value: "narrow", label: "Narrow" },
          { value: "medium", label: "Medium" },
          { value: "wide", label: "Wide" }
        ]
      }
    ]
  },
  features: {
    name: "Features",
    tag_name: "section",
    class: "features",
    settings: [
      {
        id: "title",
        type: "text",
        label: "Section Title",
        default: "Features",
        placeholder: "Enter section title"
      },
      {
        id: "columns",
        type: "range",
        label: "Number of Columns",
        default: 3,
        min: 1,
        max: 4,
        step: 1
      },
      {
        id: "features",
        type: "textarea",
        label: "Features (one per line)",
        default: "Feature One\nFeature Two\nFeature Three",
        placeholder: "Enter features, one per line"
      },
      {
        id: "iconStyle",
        type: "select",
        label: "Icon Style",
        default: "check",
        options: [
          { value: "check", label: "Checkmark" },
          { value: "star", label: "Star" },
          { value: "arrow", label: "Arrow" }
        ]
      },
      {
        id: "backgroundColor",
        type: "color",
        label: "Background Color",
        default: "#f9fafb"
      }
    ]
  },
  "image-text": {
    name: "Image with Text",
    tag_name: "section",
    class: "image-text",
    settings: [
      {
        id: "image",
        type: "image_picker",
        label: "Image",
        info: "Recommended size: 800x600px"
      },
      {
        id: "heading",
        type: "text",
        label: "Heading",
        default: "Image Section",
        placeholder: "Enter heading"
      },
      {
        id: "content",
        type: "richtext",
        label: "Content",
        default: "Describe your image content here.",
        placeholder: "Enter content"
      },
      {
        id: "imagePosition",
        type: "select",
        label: "Image Position",
        default: "left",
        options: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right" }
        ]
      },
      {
        id: "ctaText",
        type: "text",
        label: "CTA Text",
        default: "Learn More",
        placeholder: "Button text"
      },
      {
        id: "ctaLink",
        type: "url",
        label: "CTA Link",
        default: "#",
        placeholder: "https://"
      },
      {
        id: "imageOverlay",
        type: "checkbox",
        label: "Add Image Overlay",
        default: false
      },
      {
        id: "overlayOpacity",
        type: "range",
        label: "Overlay Opacity",
        default: 0,
        min: 0,
        max: 100,
        step: 10,
        visible: "imageOverlay == true"
      }
    ]
  },
  cta: {
    name: "Call to Action",
    tag_name: "section",
    class: "cta",
    settings: [
      {
        id: "title",
        type: "text",
        label: "Title",
        default: "Ready to get started?",
        placeholder: "Enter title"
      },
      {
        id: "subtitle",
        type: "textarea",
        label: "Subtitle",
        default: "Join thousands of satisfied customers today.",
        placeholder: "Enter subtitle"
      },
      {
        id: "buttonText",
        type: "text",
        label: "Button Text",
        default: "Sign Up Now",
        placeholder: "Button text"
      },
      {
        id: "buttonLink",
        type: "url",
        label: "Button Link",
        default: "#",
        placeholder: "https://"
      },
      {
        id: "backgroundColor",
        type: "color",
        label: "Background Color",
        default: "#4f46e5"
      },
      {
        id: "textColor",
        type: "color",
        label: "Text Color",
        default: "#ffffff"
      },
      {
        id: "buttonStyle",
        type: "select",
        label: "Button Style",
        default: "light",
        options: [
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
          { value: "outline", label: "Outline" }
        ]
      },
      {
        id: "fullWidth",
        type: "checkbox",
        label: "Full Width Button",
        default: false
      }
    ]
  }
};
