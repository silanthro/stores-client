import { defineStore } from 'pinia'
import { supabase } from './supabase'
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
          'full_name,clone_url,description,readme,tools(name,doc,inputs,output)',
        )
      this.tool_indexes = fetchIndexRequest.data as RepoMetadata[]
    },
  },
})
