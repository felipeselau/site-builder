import lumeCMS from "https://cdn.jsdelivr.net/gh/lumeland/cms@v0.5.0/mod.ts";

const cms = lumeCMS({
  site: {
    name: "Site Builder CMS",
  },
  collections: {
    pages: {
      label: "Pages",
      storage: "./_data",
      schema: {
        slug: { type: "slug", label: "URL Slug" },
        title: { type: "text", label: "Page Title" },
        seo: {
          type: "object",
          label: "SEO",
          fields: {
            title: { type: "text", label: "Meta Title" },
            description: { type: "textarea", label: "Meta Description" },
          },
        },
        sections: {
          type: "array",
          label: "Sections",
          of: {
            type: "object",
            fields: {
              type: { type: "select", label: "Block Type", options: [
                { value: "hero", label: "Hero" },
                { value: "content", label: "Content" },
                { value: "cta", label: "CTA" },
              ]},
              props: { type: "object", label: "Properties" },
            },
          },
        },
      },
    },
  },
});

export default cms;