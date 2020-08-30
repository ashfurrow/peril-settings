import { danger, warn, markdown } from "danger"

// Inspiration: https://github.com/artsy/artsy-danger/blob/f019ee1a3abffabad65014afabe07cb9a12274e7/org/all-prs.ts#L67-L85
export const changelog = async () => {
  // First we check if there is a changelog in the repository.
  const pr = danger.github.pr
  const changelogs = ["CHANGELOG.md", "changelog.md", "Changelog.md", "CHANGELOG.yml"]

  const getContentParams = { path: "", owner: pr.head.user.login, repo: pr.head.repo.name }
  const rootContents: any = await danger.github.api.repos.getContent(getContentParams)

  const hasChangelog = rootContents.data.find((file: any) => changelogs.includes(file.name))
  const markedTrivial = (pr.title + pr.body).includes("#trivial")
  if (hasChangelog) {
    const files = [...danger.git.modified_files, ...danger.git.created_files]

    // Look for files that aren't in a unit test directory.
    const hasCodeChanges = files.find((file: any) => !file.match(/(test|spec)/i))
    const hasChangelogChanges = files.find(file => changelogs.includes(file))
    if (!!hasCodeChanges && !hasChangelogChanges) {
      const baseMessage = "It looks like code was changed without adding anything to the Changelog. "
      if (markedTrivial) {
        markdown(baseMessage)
      } else {
        warn(
          baseMessage + "If this is a trivial PR that doesn't need a changelog, add #trivial to the PR title or body."
        )
      }
    }
  }
}

export default async () => {
  // TODO: This is not working, not sure why.
  // `danger.github.api.repos.getContent` is not a function.
  // await changelog()
}
