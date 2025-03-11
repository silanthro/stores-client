import { defineStore } from 'pinia'
import type { RepoMetadata } from '@/utils/types'

export const useToolsStore = defineStore('tools', {
  state: () => ({
    tool_indexes: ([...Array(10).keys()] as any[]).fill({
      name: 'file-ops',
      full_name: 'greentfrapp/file-ops',
      clone_url: 'https://github.com/greentfrapp/file-ops.git',
      created_at: new Date('2025-03-08T06:29:09.000Z'),
      pushed_at: new Date('2025-03-08T15:36:35.000Z'),
      branch: 'main',
      commit: '54124a6a346629d58b597102a5ed18489429c7ae',
      desc: 'A set of tools for working with the local file system e.g. creating, opening, and deleting files.',
      num_tools: 10,
      readme: '# file-ops',
      tools: [
        {
          name: 'create_file',
          doc: 'Create a file at filepath\nArgs:\n- filepath (str): Filepath of file to write (required)',
          inputs: [
            {
              name: 'filepath',
              type: 'str',
            },
          ],
          output: 'None',
        },
        {
          name: 'read_file',
          doc: 'Create a file at filepath\nArgs:\n- filepath (str): Filepath of file to read (required)',
          inputs: [
            {
              name: 'filepath',
              type: 'str',
            },
          ],
          output: 'str',
        },
      ],
    }) as RepoMetadata[],
  }),
  getters: {},
  actions: {},
})
