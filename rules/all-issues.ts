import { danger, markdown } from "danger"
import { Issues } from "github-webhook-event-types"

const staleMessage = `\
Hey! It looks like this repo hasn't been updated for a while. \
That probably means the repo's not a high-priority for @ashfurrow. He'll answer \
this issue if he can, but just a head's up.

If you're using this project, you have the skills to improve it. If you've \
reported a bug, you are encouraged to open a pull request that fixes it. \
And of course, you're welcome to discuss with other developers in this \
repository's issues and pull requests. Have a great day!`

export const markRepoAsStale = async () => {
  const issue = (danger.github as any) as Issues
  const repoName = issue.repository.name
  const api = danger.github.api
  const now = new Date()
  const sixMonthsAgo = now.setMonth(now.getMonth() - 6)

  const result = await api.repos.get({ repo: repoName, owner: "ashfurrow" })
  // `pushed_at` is the last time that any commit was made to any branch.
  if (Date.parse(result.data.pushed_at) < sixMonthsAgo) {
    markdown(staleMessage)
  }
}

export const vacation = (event: Issues, vacationEndDate?: string) => {
  if (!vacationEndDate) {
    return
  }
  danger.github.api.issues.createComment({
    body: `Hello! Thank you for the issue, but @ashfurrow is on vacation until ${vacationEndDate}. Hopefully there's another contributor available to help in the meantime – good luck!`,
    number: event.issue.number,
    owner: "ashfurrow",
    repo: event.repository.name,
  })
}

export default async (event: Issues) => {
  await markRepoAsStale()
  vacation(event, process.env.VACATION_END_DATE)
}
