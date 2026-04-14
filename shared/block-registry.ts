import type { BlockRegistry } from "./types.ts";

export const blockRegistry: BlockRegistry = {
  hero: {
    label: "Hero",
    fields: [
      { key: "title", type: "text", label: "Title" },
      { key: "subtitle", type: "textarea", label: "Subtitle" },
      { key: "ctaText", type: "text", label: "CTA Button Text" },
      { key: "ctaLink", type: "text", label: "CTA Link" },
      { key: "backgroundImage", type: "image", label: "Background Image" },
      { key: "backgroundColor", type: "color", label: "Background Color", default: "#1a1a2e" },
      { key: "textColor", type: "color", label: "Text Color", default: "#ffffff" },
    ],
    defaultProps: {
      title: "Welcome to Your Site",
      subtitle: "Build amazing websites with our site builder",
      ctaText: "Get Started",
      ctaLink: "#",
      backgroundColor: "#1a1a2e",
      textColor: "#ffffff",
    },
  },
  content: {
    label: "Content",
    fields: [
      { key: "heading", type: "text", label: "Heading" },
      { key: "content", type: "textarea", label: "Content" },
      { key: "alignment", type: "select", label: "Alignment", options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" },
      ], default: "left" },
    ],
    defaultProps: {
      heading: "About Us",
      content: "Add your content here. Tell your story, share your vision.",
      alignment: "left",
    },
  },
  features: {
    label: "Features",
    fields: [
      { key: "title", type: "text", label: "Section Title" },
      { key: "columns", type: "number", label: "Number of Columns", default: 3 },
      { key: "features", type: "textarea", label: "Features (one per line)" },
    ],
    defaultProps: {
      title: "Features",
      columns: 3,
      features: "Feature One\nFeature Two\nFeature Three",
    },
  },
  "image-text": {
    label: "Image + Text",
    fields: [
      { key: "image", type: "image", label: "Image" },
      { key: "heading", type: "text", label: "Heading" },
      { key: "content", type: "textarea", label: "Content" },
      { key: "imagePosition", type: "select", label: "Image Position", options: [
        { value: "left", label: "Left" },
        { value: "right", label: "Right" },
      ], default: "left" },
      { key: "ctaText", type: "text", label: "CTA Text" },
      { key: "ctaLink", type: "text", label: "CTA Link" },
    ],
    defaultProps: {
      heading: "Image Section",
      content: "Describe your image content here.",
      imagePosition: "left",
      ctaText: "Learn More",
      ctaLink: "#",
    },
  },
  cta: {
    label: "CTA",
    fields: [
      { key: "title", type: "text", label: "Title" },
      { key: "subtitle", type: "text", label: "Subtitle" },
      { key: "buttonText", type: "text", label: "Button Text" },
      { key: "buttonLink", type: "text", label: "Button Link" },
      { key: "backgroundColor", type: "color", label: "Background Color", default: "#4f46e5" },
    ],
    defaultProps: {
      title: "Ready to get started?",
      subtitle: "Join thousands of satisfied customers today.",
      buttonText: "Sign Up Now",
      buttonLink: "#",
      backgroundColor: "#4f46e5",
    },
  },
};