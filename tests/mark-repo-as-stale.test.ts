jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import { markRepoAsStale } from "../rules/new-issue"

beforeEach(() => {
  dm.danger = {}
  dm.warn = jest.fn()
  dm.markdown = jest.fn()
})

const thisPR = {
  repo: "some-repo",
}

it("does nothing if the repo was updated within the last six months", () => {
  dm.danger.github = {
    api: {
      repos: {
        get: () => Promise.resolve({ pushed_at: Date.now() }),
      },
    },
    thisPR,
  }
  return markRepoAsStale().then(() => {
    expect(dm.markdown).not.toHaveBeenCalled()
  })
})

it("warns if the repo was updated a long time ago", () => {
  dm.danger.github = {
    api: {
      repos: {
        get: () => Promise.resolve({ pushed_at: "2017-01-26T19:14:43Z" }),
      },
    },
    thisPR,
  }
  return markRepoAsStale().then(() => {
    expect(dm.markdown).toHaveBeenCalled()
  })
})
