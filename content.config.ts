import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    codeSnippet: defineCollection({
      type: 'page',
      source: 'code_snippet.md',
    }),
    about: defineCollection({
      type: 'page',
      source: 'about.md',
    }),
    quickstarts: defineCollection({
      type: 'page',
      source: 'docs/quickstarts/*.md',
      schema: z.object({
        rawbody: z.string(),
        order: z.number(),
      }),
    }),
    guide: defineCollection({
      type: 'page',
      source: {
        include: 'docs/guide/**/**.md',
        exclude: ['docs/guide/contents.md'],
      },
      schema: z.object({
        rawbody: z.string(),
      }),
    }),
    guideTOC: defineCollection({
      type: 'page',
      source: 'docs/guide/toc.md',
    }),
    contribute: defineCollection({
      type: 'page',
      source: 'docs/contribute/*.md',
    }),
    install: defineCollection({
      type: 'page',
      source: 'docs/install.md',
    }),
  },
})
