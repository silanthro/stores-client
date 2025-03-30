import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'
import type { RepoMetadata } from '@/utils/types/tools'
import { uniqBy } from '@/utils/utils'

export const useToolsStore = defineStore('tools', {
  state: () => ({
    tool_indexes: [] as RepoMetadata[],
  }),
  getters: {},
  actions: {
    async refresh() {
      const fetchIndexRequest = await supabase
        .from('tool_indexes')
        .select(
          'full_name,owner,version,clone_url,commit,description,readme,tools(name,doc,inputs,output)',
        )
        .order('added_at', { ascending: false })
      // Remove duplicates due to versioning
      this.tool_indexes = uniqBy(
        fetchIndexRequest.data as any[],
        (item: any) => item.full_name,
      ) as RepoMetadata[]
    },
  },
})
