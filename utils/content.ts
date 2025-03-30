import type { Article } from '@/utils/types/docs'

export async function parseTOC(
  collectionTOC: string,
  collection: string,
  linkFormatter?: (post: any) => string,
) {
  // Retrieve TOC file
  const referenceTOC = await queryCollection(collectionTOC as any).first()
  // Retrieve all posts in collection
  const posts = await queryCollection(collection as any).all()

  return getListItems(referenceTOC.body.value[0], posts || [], linkFormatter)
}

function getListItems(
  items: any,
  collection: any[],
  linkFormatter?: (post: any) => string,
): Article[] {
  const isLineItem = items[0] === 'li'
  items = items.slice(2)
  if (isLineItem) {
    const itemName = items[0].trim()
    const article: Article = {
      id: itemName,
      label: itemName,
      title: itemName,
      children:
        items.length > 1
          ? items
              .slice(1)
              .map((i: any) => getListItems(i, collection, linkFormatter))[0]
          : undefined,
    }
    if (itemName.endsWith('.md')) {
      // Find article in collection
      const post = collection.find((p) => p.id.endsWith(itemName))
      if (post) {
        article.id = post.id
        article.label = post.meta.short_name || post.title || ''
        article.title = post.title
        article.link = linkFormatter ? linkFormatter(post) : '/' + post.stem
      }
    }
    return [article]
  }
  return items.map((i: any) => getListItems(i, collection, linkFormatter)[0])
}
