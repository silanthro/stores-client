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
        exclude: ['docs/guide/toc.md'],
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
      source: {
        include: 'docs/contribute/*.md',
        exclude: ['docs/contribute/toc.md'],
      },
      schema: z.object({
        rawbody: z.string(),
        updatedAt: z.date(),
      }),
    }),
    contributeTOC: defineCollection({
      type: 'page',
      source: 'docs/contribute/toc.md',
    }),
    install: defineCollection({
      type: 'page',
      source: 'docs/install.md',
    }),
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: z.object({
        rawbody: z.string(),
        updatedAt: z.date(),
      }),
    }),
    cookbook: defineCollection({
      type: 'page',
      source: {
        include: 'docs/cookbook/*.md',
        exclude: ['docs/cookbook/toc.md'],
      },
      schema: z.object({
        rawbody: z.string(),
        updatedAt: z.date(),
      }),
    }),
    cookbookTOC: defineCollection({
      type: 'page',
      source: 'docs/cookbook/toc.md',
    }),
  },
})
