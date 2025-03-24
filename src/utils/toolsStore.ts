import { defineStore } from 'pinia'
import { supabase } from './supabase'
import { uniqBy } from './utils'
import type { RepoMetadata } from '@/utils/types'

export const useToolsStore = defineStore('tools', {
  state: () => ({
    tool_indexes: [] as RepoMetadata[],
  }),
  getters: {},
  actions: {
    async init() {
      const fetchIndexRequest = await supabase
        .from('tool_indexes')
        .select(
          'full_name,owner,version,clone_url,commit,description,readme,tools(name,doc,inputs,output)',
        )
      // Remove duplicates due to versioning
      this.tool_indexes = uniqBy(
        fetchIndexRequest.data as any[],
        (item: any) => item.full_name,
      ) as RepoMetadata[]
    },
  },
})
