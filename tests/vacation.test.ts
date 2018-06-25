jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import { Issues } from "github-webhook-event-types"

import { vacation } from "../rules/all-issues"

beforeEach(() => {
  dm.danger = {}
  dm.markdown = jest.fn()
  dm.peril = { env: {} }
})

it("does nothing with no env", async () => {
  dm.peril.env.VACATION_END_DATE = undefined

  vacation()
  expect(dm.markdown).not.toHaveBeenCalled()
})

describe("with a VACATION_END_DATE env var set", () => {
  it("sends a markdown message", () => {
    dm.peril.env.VACATION_END_DATE = "July 11th"

    vacation()
    expect(dm.markdown).toHaveBeenCalled()
  })
})
