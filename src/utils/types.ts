export interface ToolMetadata {
  name: string
  doc: string
  inputs: any[]
  output: string
}

export interface RepoMetadata {
  full_name: string
  clone_url: string
  added_at?: Date
  pushed_at: Date
  branch: string
  owner?: string
  commit?: string
  description?: string
  readme?: string
  tools?: ToolMetadata[]
}

export interface Tutorial {
  id: string
  title: string
  section: string
  filename: string
  content?: string
}

export interface Heading {
  id: string
  text: string
  level: number
}

export interface MarkdownContent {
  content: string
  headings: Heading[]
}

export interface CodeBlockProps {
  code: string
  language: string
}

export interface TutorialGridProps {
  tutorials: Tutorial[]
  onSelectTutorial: (id: string) => void
}

export interface DocsSidebarProps {
  tutorials: Tutorial[]
  activeTutorial?: Tutorial
  onSelectTutorial: (id: string | null) => void
}
