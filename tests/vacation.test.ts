jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import { vacation } from "../rules/all-issues"

beforeEach(() => {
  dm.danger = {
    github: {
      api: {
        issues: {
          createComment: jest.fn(),
        },
      },
    },
  }
  dm.markdown = jest.fn()
  dm.peril = { env: {} }
})

it("does nothing with no env", async () => {
  vacation({} as any, undefined)
  expect(dm.danger.github.api.issues.createComment).not.toHaveBeenCalled()
})

describe("with a VACATION_END_DATE env var set", () => {
  it("sends a markdown message", () => {
    vacation({ issue: { number: 1 }, repository: { name: "unit test" } } as any, "July 11th")
    expect(dm.danger.github.api.issues.createComment).toHaveBeenCalled()
  })
})
