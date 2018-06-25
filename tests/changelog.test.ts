jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import changelog from "../rules/changelog"

beforeEach(() => {
  dm.danger = {}
  dm.warn = jest.fn()
  dm.markdown = jest.fn()
})

const pr = {
  head: {
    user: {
      login: "danger",
    },
    repo: {
      name: "danger-js",
    },
  },
  title: "This is the pull request title.",
  body: "",
}

it("warns when code has changed but no changelog entry was made", () => {
  dm.danger.github = {
    api: {
      repos: {
        getContent: () => Promise.resolve({ data: [{ name: "code.swift" }, { name: "CHANGELOG.md" }] }),
      },
    },
    pr,
  }
  dm.danger.git = {
    modified_files: ["code.swift"],
    created_files: [],
  }
  return changelog().then(() => {
    expect(dm.warn).toBeCalled()
  })
})

it("does nothing when there is no changelog file", () => {
  dm.danger.github = {
    api: {
      repos: {
        getContent: () => Promise.resolve({ data: [{ name: "code.js" }] }),
      },
    },
    pr,
  }
  dm.danger.git = {
    modified_files: [],
    created_files: [],
  }
  return changelog().then(() => {
    expect(dm.warn).not.toBeCalled()
  })
})

it("does nothing when only `test` files were changed", () => {
  dm.danger.github = {
    api: {
      repos: {
        getContent: () => Promise.resolve({ data: [{ name: "CHANGELOG.md" }] }),
      },
    },
    pr,
  }
  dm.danger.git = {
    modified_files: ["Tests/CalculatorSpec.swift"],
    created_files: [],
  }
  return changelog().then(() => {
    expect(dm.warn).not.toBeCalled()
  })
})

it("does nothing when the changelog was changed", () => {
  dm.danger.github = {
    api: {
      repos: {
        getContent: () => Promise.resolve({ data: [{ name: "code.js" }, { name: "CHANGELOG.md" }] }),
      },
    },
    pr,
  }
  dm.danger.git = {
    modified_files: ["src/index.html", "CHANGELOG.md"],
    created_files: [],
  }
  return changelog().then(() => {
    expect(dm.warn).not.toBeCalled()
  })
})

it("sends a message if the PR title includes #trivial", () => {
  dm.danger.github = {
    api: {
      repos: {
        getContent: () => Promise.resolve({ data: [{ name: "code.swift" }, { name: "CHANGELOG.md" }] }),
      },
    },
    pr: {
      ...pr,
      title: "Just fixing some typos #trivial",
    },
  }
  dm.danger.git = {
    modified_files: ["code.swift"],
    created_files: [],
  }
  return changelog().then(() => {
    expect(dm.markdown).toBeCalled()
  })
})

it("sends a message if the PR body includes #trivial", () => {
  dm.danger.github = {
    api: {
      repos: {
        getContent: () => Promise.resolve({ data: [{ name: "code.swift" }, { name: "CHANGELOG.md" }] }),
      },
    },
    pr: {
      ...pr,
      title: "Just fixing some typos",
      body: "Nothing fancy, pretty #trivial",
    },
  }
  dm.danger.git = {
    modified_files: ["code.swift"],
    created_files: [],
  }
  return changelog().then(() => {
    expect(dm.markdown).toBeCalled()
  })
})
