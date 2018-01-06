// For the inspiration for this file, see: https://github.com/RxSwiftCommunity/peril/blob/master/org/aeryn.ts
import { schedule, danger, markdown } from "danger"

// The inspiration for this is https://github.com/artsy/artsy-danger/blob/f019ee1a3abffabad65014afabe07cb9a12274e7/org/all-prs.ts
const isJest = typeof jest !== "undefined"
// Returns the promise itself, for testing.
const _test = (reason: string, promise: Promise<any>) => promise
// Schedules the promise for execution via Danger.
const _run = (reason: string, promise: Promise<any>) => schedule(promise)
const wrap: any = isJest ? _test : _run

export const aeryn = wrap("When a PR is merged, check if the author is in the org", async () => {
  const pr = danger.github.pr
  const repo = danger.github.pr.head.repo.name
  const owner = "ashfurrow"
  const username = pr.user.login
  const api = danger.github.api

  if (!pr.merged) {
    // Only proceed if the PR was merged (as opposed to closed without merging).
    return
  }

  const inviteMarkdown = `
  Thanks a lot for contributing @${username}! You've been invited to be a 
  collaborator on this repo – no pressure to accept! If you'd like 
  more information on what this means, check out the [Moya contributor guidelines][c]
  and feel free to reach out with any questions.
  
  [c]: https://github.com/Moya/contributors
  `

  try {
    // This throws if the user isn't a member of the repo yet. If it doesn't
    // throw, then it means the user was already invited or has already
    // accepted the invitation (we ignore the return value here).
    await api.repos.checkCollaborator({ owner, repo, username })
  } catch (error) {
    markdown(inviteMarkdown)
    await api.repos.addCollaborator({ owner, repo, username })
  }
})