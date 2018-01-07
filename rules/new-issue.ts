import { schedule, danger, markdown } from "danger"
import { Issues } from "github-webhook-event-types"

// The inspiration for this is https://github.com/artsy/artsy-danger/blob/f019ee1a3abffabad65014afabe07cb9a12274e7/org/all-prs.ts
const isJest = typeof jest !== "undefined"
// Returns the promise itself, for testing.
const _test = (reason: string, promise: Promise<any>) => promise
// Schedules the promise for execution via Danger.
const _run = (reason: string, promise: Promise<any>) => schedule(promise)
const wrap: any = isJest ? _test : _run

export const markRepoAsStale = wrap(
  "If the repo hasn't been updated for more than six months, then post a comment",
  async () => {
    const issue = (danger.github as any) as Issues
    const repoName = issue.repository.name
    const api = danger.github.api
    const sixMonthsAgo = Date.now() - 3600 * 24 * 30 * 6

    const repo = await api.repos.get({ repo: repoName, owner: "ashfurrow" })
    // `pushed_at` is the last time that any commit was made to any branch.
    if (Date.parse(repo.pushed_at) < sixMonthsAgo) {
      markdown(`
      Hey! It looks like this repo hasn't been updated for a while. That
      probably means the repo's not a high-priority for @ashfurrow. He'll answer 
      this issue if he can, but just a head's up.

      If you're using this project, you have the skills to improve it. If you've
      reported a bug, you are encouraged to open a pull request that fixes it.
      And of course, you're welcome to discuss with other developers in this
      repository's issues and pull requests. Have a great day!
    `)
    }
  }
)
