export interface Quickstart {
  id: string
  title: string
  section: string
  logo: string
}

export interface Article {
  id: string
  label: string
  title: string
  link?: string
  children?: Article[]
  metadata?: any
}

export interface TOCLink {
  id: string
  depth: number
  text: string
  children?: TOCLink[]
}
