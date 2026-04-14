import { describe, it, expect } from "vitest";
import { detect } from "../../src/parsers/index.js";

// ---------------------------------------------------------------------------
// npm
// ---------------------------------------------------------------------------
describe("npm parser", () => {
  it("npm install express", () => {
    const r = detect("npm install express");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "npm",
      packages: ["express"],
      command: "npm install express",
      isDev: false,
      isGlobal: false,
    });
  });

  it("npm i express@4.0 (shorthand + version)", () => {
    const r = detect("npm i express@4.0");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "npm",
      packages: ["express@4.0"],
      isDev: false,
    });
  });

  it("npm add @scope/pkg --save-dev", () => {
    const r = detect("npm add @scope/pkg --save-dev");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "npm",
      packages: ["@scope/pkg"],
      isDev: true,
      isGlobal: false,
    });
    expect(r[0]!.flags).toContain("--save-dev");
  });

  it("npm ci (lockfile install, no packages)", () => {
    const r = detect("npm ci");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "npm",
      packages: [],
      command: "npm ci",
    });
  });

  it("npm install (no args)", () => {
    const r = detect("npm install");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "npm",
      packages: [],
    });
  });

  it("npm install -g typescript (global)", () => {
    const r = detect("npm install -g typescript");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "npm",
      packages: ["typescript"],
      isGlobal: true,
      isDev: false,
    });
  });

  it("npm install foo && npm install bar (compound)", () => {
    const r = detect("npm install foo && npm install bar");
    expect(r).toHaveLength(2);
    expect(r[0]).toMatchObject({
      packageManager: "npm",
      packages: ["foo"],
    });
    expect(r[1]).toMatchObject({
      packageManager: "npm",
      packages: ["bar"],
    });
  });
});

// ---------------------------------------------------------------------------
// yarn
// ---------------------------------------------------------------------------
describe("yarn parser", () => {
  it("yarn add react", () => {
    const r = detect("yarn add react");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "yarn",
      packages: ["react"],
      isDev: false,
    });
  });

  it("yarn add react --dev", () => {
    const r = detect("yarn add react --dev");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "yarn",
      packages: ["react"],
      isDev: true,
    });
    expect(r[0]!.flags).toContain("--dev");
  });

  it("yarn install (no packages)", () => {
    const r = detect("yarn install");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "yarn",
      packages: [],
    });
  });

  it("yarn (bare command)", () => {
    const r = detect("yarn");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "yarn",
      packages: [],
      command: "yarn",
    });
  });

  it("yarn add @types/node (scoped package)", () => {
    const r = detect("yarn add @types/node");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "yarn",
      packages: ["@types/node"],
    });
  });
});

// ---------------------------------------------------------------------------
// pnpm
// ---------------------------------------------------------------------------
describe("pnpm parser", () => {
  it("pnpm add express", () => {
    const r = detect("pnpm add express");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "pnpm",
      packages: ["express"],
    });
  });

  it("pnpm install (no packages)", () => {
    const r = detect("pnpm install");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "pnpm",
      packages: [],
    });
  });

  it("pnpm i (shorthand)", () => {
    const r = detect("pnpm i");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "pnpm",
      packages: [],
    });
  });

  it("pnpm add -D vitest (dev dependency)", () => {
    const r = detect("pnpm add -D vitest");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "pnpm",
      packages: ["vitest"],
      isDev: true,
    });
  });

  it("pnpm add -g tsx (global)", () => {
    const r = detect("pnpm add -g tsx");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "pnpm",
      packages: ["tsx"],
      isGlobal: true,
    });
  });
});

// ---------------------------------------------------------------------------
// pip
// ---------------------------------------------------------------------------
describe("pip parser", () => {
  it("pip install requests", () => {
    const r = detect("pip install requests");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "pip",
      packages: ["requests"],
    });
  });

  it("pip3 install flask==2.0", () => {
    const r = detect("pip3 install flask==2.0");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "pip",
      packages: ["flask==2.0"],
    });
  });

  it("python -m pip install django>=4.0", () => {
    const r = detect("python -m pip install django>=4.0");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "pip",
      packages: ["django>=4.0"],
    });
  });

  it("pip install -r requirements.txt", () => {
    const r = detect("pip install -r requirements.txt");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "pip",
      packages: ["-r requirements.txt"],
    });
  });

  it("pip install --upgrade pip", () => {
    const r = detect("pip install --upgrade pip");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "pip",
      packages: ["pip"],
    });
    expect(r[0]!.flags).toContain("--upgrade");
  });
});

// ---------------------------------------------------------------------------
// uv
// ---------------------------------------------------------------------------
describe("uv parser", () => {
  it("uv pip install requests", () => {
    const r = detect("uv pip install requests");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "uv",
      packages: ["requests"],
    });
  });

  it("uv add flask", () => {
    const r = detect("uv add flask");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "uv",
      packages: ["flask"],
    });
  });

  it("uv add --dev pytest", () => {
    const r = detect("uv add --dev pytest");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "uv",
      packages: ["pytest"],
      isDev: true,
    });
    expect(r[0]!.flags).toContain("--dev");
  });
});

// ---------------------------------------------------------------------------
// cargo
// ---------------------------------------------------------------------------
describe("cargo parser", () => {
  it("cargo add serde", () => {
    const r = detect("cargo add serde");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "cargo",
      packages: ["serde"],
      isGlobal: false,
    });
  });

  it("cargo install ripgrep (global)", () => {
    const r = detect("cargo install ripgrep");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "cargo",
      packages: ["ripgrep"],
      isGlobal: true,
    });
  });

  it("cargo add tokio --features full", () => {
    const r = detect("cargo add tokio --features full");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "cargo",
      packages: ["tokio"],
    });
    expect(r[0]!.flags).toContain("--features=full");
  });
});

// ---------------------------------------------------------------------------
// go
// ---------------------------------------------------------------------------
describe("go parser", () => {
  it("go get golang.org/x/text@latest", () => {
    const r = detect("go get golang.org/x/text@latest");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "go",
      packages: ["golang.org/x/text@latest"],
      isGlobal: false,
    });
  });

  it("go install github.com/user/tool@v1.0.0 (global)", () => {
    const r = detect("go install github.com/user/tool@v1.0.0");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "go",
      packages: ["github.com/user/tool@v1.0.0"],
      isGlobal: true,
    });
  });
});

// ---------------------------------------------------------------------------
// gem
// ---------------------------------------------------------------------------
describe("gem parser", () => {
  it("gem install rails", () => {
    const r = detect("gem install rails");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "gem",
      packages: ["rails"],
      isGlobal: true,
    });
  });

  it("gem install nokogiri -v 1.16", () => {
    const r = detect("gem install nokogiri -v 1.16");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "gem",
      packages: ["nokogiri"],
    });
    expect(r[0]!.flags).toContain("--version=1.16");
  });
});

// ---------------------------------------------------------------------------
// composer
// ---------------------------------------------------------------------------
describe("composer parser", () => {
  it("composer require laravel/framework", () => {
    const r = detect("composer require laravel/framework");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "composer",
      packages: ["laravel/framework"],
    });
  });

  it("composer require --dev phpunit/phpunit", () => {
    const r = detect("composer require --dev phpunit/phpunit");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "composer",
      packages: ["phpunit/phpunit"],
      isDev: true,
    });
    expect(r[0]!.flags).toContain("--dev");
  });

  it("composer require vendor/pkg:^2.0 (version constraint)", () => {
    const r = detect("composer require vendor/pkg:^2.0");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "composer",
      packages: ["vendor/pkg:^2.0"],
    });
  });
});

// ---------------------------------------------------------------------------
// brew
// ---------------------------------------------------------------------------
describe("brew parser", () => {
  it("brew install node", () => {
    const r = detect("brew install node");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "brew",
      packages: ["node"],
      isGlobal: true,
    });
  });

  it("brew install --cask firefox", () => {
    const r = detect("brew install --cask firefox");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "brew",
      packages: ["firefox"],
    });
    expect(r[0]!.flags).toContain("--cask");
  });

  it("brew reinstall python", () => {
    const r = detect("brew reinstall python");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      packageManager: "brew",
      packages: ["python"],
    });
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe("edge cases", () => {
  it("non-install commands return empty array", () => {
    expect(detect("npm test")).toEqual([]);
    expect(detect("pip --version")).toEqual([]);
    expect(detect("cargo build")).toEqual([]);
    expect(detect("yarn run dev")).toEqual([]);
    expect(detect("go build ./...")).toEqual([]);
    expect(detect("brew update")).toEqual([]);
    expect(detect("gem list")).toEqual([]);
    expect(detect("composer install")).toEqual([]);
    expect(detect("pnpm run build")).toEqual([]);
  });

  it("compound commands with mixed managers", () => {
    const r = detect("npm install express && pip install flask");
    expect(r).toHaveLength(2);
    expect(r[0]).toMatchObject({
      packageManager: "npm",
      packages: ["express"],
    });
    expect(r[1]).toMatchObject({
      packageManager: "pip",
      packages: ["flask"],
    });
  });

  it("empty string returns empty array", () => {
    expect(detect("")).toEqual([]);
  });

  it("random text returns empty array", () => {
    expect(detect("hello world")).toEqual([]);
  });

  it("semicolon-separated compound commands", () => {
    const r = detect("npm install foo; yarn add bar");
    expect(r).toHaveLength(2);
    expect(r[0]).toMatchObject({
      packageManager: "npm",
      packages: ["foo"],
    });
    expect(r[1]).toMatchObject({
      packageManager: "yarn",
      packages: ["bar"],
    });
  });
});
