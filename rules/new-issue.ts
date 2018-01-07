import { schedule, danger, markdown } from "danger"
import { Issues } from "github-webhook-event-types"

// The inspiration for this is https://github.com/artsy/artsy-danger/blob/f019ee1a3abffabad65014afabe07cb9a12274e7/org/all-prs.ts
const isJest = typeof jest !== "undefined"
// Returns the promise itself, for testing.
const _test = (reason: string, promise: Promise<any>) => promise
// Schedules the promise for execution via Danger.
const _run = (reason: string, promise: Promise<any>) => schedule(promise)
const wrap: any = isJest ? _test : _run

// If the repo hasn't been updated for more than six months, then post a comment.
export const markRepoAsStale = async () => {
  const issue = danger.github.issue
  const repoName = danger.github.thisPR.repo
  const api = danger.github.api
  const sixMonthsAgo = Date.now() - 3600 * 24 * 30 * 6

  const repo = await api.repos.get({ repo: repoName, owner: "ashfurrow" })
  if (repo.pushed_at < sixMonthsAgo) {
    markdown(`
      Hey! It looks like this repo hasn't been updated for a while. That
      probably means the repo's not a high-priority for @ashfurrow. He'll answer 
      this issue if he can, but just a head's up.
    `)
  }
}
