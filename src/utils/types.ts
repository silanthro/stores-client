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
