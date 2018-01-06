jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import { aeryn } from "../rules/aeryn"

// danger.github.pr.head.repo.name
beforeEach(() => {
  dm.danger = {
    github: {
      pr: {
        user: {
          login: "a_new_user",
        },
        head: {
          repo: {
            name: "some_repo",
          },
        },
      },
    },
  }
  dm.markdown = jest.fn()
})

it("doesn't do anything if the PR was closed without merging", () => {
  return aeryn().then(() => {
    expect(dm.markdown).not.toHaveBeenCalled()
  })
})

describe("a merged PR", () => {
  beforeEach(() => {
    dm.danger.github.pr.merged = true
  })

  it("doesn't do anything if the user is already invited", () => {
    dm.danger.github.api = {
      repos: {
        checkCollaborator: async () => {},
      },
    }
    return aeryn().then(() => {
      expect(dm.markdown).not.toHaveBeenCalled()
    })
  })

  it("invites the user", () => {
    const inviteMock = jest.fn()
    dm.danger.github.api = {
      repos: {
        checkCollaborator: async () => {
          throw new Error("Not a member")
        },
        addCollaborator: inviteMock,
      },
    }
    return aeryn().then(() => {
      expect(dm.markdown).toHaveBeenCalled()
      expect(inviteMock).toHaveBeenCalled()
    })
  })
})
