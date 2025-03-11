export interface ToolMetadata {
  name: string
  doc: string
  inputs: any[]
  output: string
}

export interface RepoMetadata {
  name: string
  full_name: string
  clone_url: string
  created_at: Date
  pushed_at: Date
  branch: string
  commit?: string
  desc?: string
  num_tools?: number
  readme?: string
  tools?: ToolMetadata[]
}
