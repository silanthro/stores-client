import type { ToolMetadata } from '@/utils/types'

export async function getUserRepos(token: string) {
  // Retrieves public repos via the /user/repos endpoint
  // with pagination if necessary
  const url = new URL('https://api.github.com/user/repos')

  const options: { [key: string]: any } = {
    sort: 'pushed',
    direction: 'desc',
    visibility: 'public',
    affiliation: 'owner,collaborator,organization_member',
    per_page: 100,
    page: 1,
  }
  for (const option in options) {
    url.searchParams.set(option, options[option])
  }

  let urlString = url.toString()

  let repos: any[] = []
  while (true) {
    const response = await fetch(urlString, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    const responseJson = await response.json()
    repos = repos.concat(responseJson)
    const linkString = response.headers.get('link')
    if (linkString) {
      const linkRgx = /<(?<url>.*?)>; rel="(?<rel>.*?)"/
      const links = Object.fromEntries(
        linkString
          .split(',')
          .map((s) => linkRgx.exec(s)?.groups)
          .map((l: any) => [l.rel, l.url]),
      )
      if (!links.next || !links.last || urlString === links.last) {
        break
      } else {
        urlString = links.next
      }
    } else {
      break
    }
  }
  return repos.map((r) => ({
    full_name: r.full_name,
    clone_url: r.clone_url,
    pushed_at: new Date(r.pushed_at),
    branch: r.default_branch,
    owner: r.owner.login,
  }))
}

export async function getBranches(repo_full_name: string, token: string) {
  // Retrieves branches repos via the /repos/OWNER/REPO/branches endpoint
  // with pagination if necessary
  const url = new URL(`https://api.github.com/repos/${repo_full_name}/branches`)

  const options: { [key: string]: any } = {
    per_page: 100,
    page: 1,
  }
  for (const option in options) {
    url.searchParams.set(option, options[option])
  }

  let urlString = url.toString()

  let branches: any[] = []
  while (true) {
    const response = await fetch(urlString, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    const responseJson = await response.json()
    branches = branches.concat(responseJson)
    const linkString = response.headers.get('link')
    if (linkString) {
      const linkRgx = /<(?<url>.*?)>; rel="(?<rel>.*?)"/
      const links = Object.fromEntries(
        linkString
          .split(',')
          .map((s) => linkRgx.exec(s)?.groups)
          .map((l: any) => [l.rel, l.url]),
      )
      if (!links.next || !links.last || urlString === links.last) {
        break
      } else {
        urlString = links.next
      }
    } else {
      break
    }
  }
  return branches.map((b) => ({
    name: b.name,
    commit: b.commit.sha,
  }))
}

export async function loadToolIndex(clone_url: string) {
  const url = import.meta.env.VITE_TOOL_PARSING_URL
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      clone_url,
    }),
  })
  const responseJSON = await response.json()
  if (typeof responseJSON === 'string') {
    return { error: responseJSON }
  }
  return {
    tools: responseJSON.tools_metadata as ToolMetadata[],
    readme: responseJSON.readme as string,
  }
}
