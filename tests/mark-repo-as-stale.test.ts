jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import { Issues } from "github-webhook-event-types"

import { markRepoAsStale } from "../rules/all-issues"

beforeEach(() => {
  dm.danger = {}
  dm.warn = jest.fn()
  dm.markdown = jest.fn()
})

const thisIssue = {
  repository: { name: "some-repo" },
} as Issues

it("does nothing if the repo was updated within the last six months", () => {
  dm.danger.github = {
    api: {
      repos: {
        get: () => Promise.resolve({ data: { pushed_at: Date.now() } }),
      },
    },
    ...thisIssue,
  }
  return markRepoAsStale().then(() => {
    expect(dm.markdown).not.toHaveBeenCalled()
  })
})

it("warns if the repo was updated a long time ago", () => {
  dm.danger.github = {
    api: {
      repos: {
        get: () => Promise.resolve({ data: { pushed_at: "2017-01-26T19:14:43Z" } }),
      },
    },
    ...thisIssue,
  }
  return markRepoAsStale().then(() => {
    expect(dm.markdown).toHaveBeenCalled()
  })
})
