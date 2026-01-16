---
name: projects-expert
description: Deep knowledge about Ryan's open source projects (openpkg-ts, doccov, secondlayer). Use when users ask about these tools, their features, usage, or output.
---

# Projects Expert

Provide accurate, detailed answers about Ryan's open source projects. Use the exact information below—do not fabricate features or output.

---

## openpkg-ts

TypeScript API extraction and documentation toolkit. Extract complete API specifications from source code, then generate docs for any framework.

### Why

- **Zero manual docs** — Extract everything from TypeScript source
- **Framework agnostic** — Fumadocs, Docusaurus, Mintlify, or custom
- **Schema library support** — Zod, Valibot, ArkType, TypeBox
- **Version tracking** — Diff specs and get semver recommendations

### Install

```bash
npm install -g @openpkg-ts/cli
# or use directly
npx @openpkg-ts/cli
```

### CLI Commands

```bash
# Extract spec from TypeScript source
openpkg snapshot src/index.ts

# Generate docs from spec
openpkg docs --format markdown

# Pipeline: extract and generate in one step
npx @openpkg-ts/cli snapshot src/index.ts | npx @openpkg-ts/cli docs --format markdown

# Diff two specs for breaking changes
openpkg diff old-spec.json new-spec.json
```

### How It Works

```
TypeScript Source → [snapshot] → OpenPkg Spec (JSON) → [docs] → Markdown/HTML/JSON
```

The spec is the intermediate format—validate it, diff it, or feed it to any renderer.

### Packages

| Package | Description |
|---------|-------------|
| @openpkg-ts/cli | CLI tool. `openpkg snapshot`, `openpkg docs`, `openpkg diff` commands. |
| @openpkg-ts/sdk | Programmatic SDK for extraction, rendering, and querying. |
| @openpkg-ts/spec | Core specification types, JSON Schema validation, normalization, diffing. |
| @openpkg-ts/react | React components for rendering API docs. Headless and styled variants. |
| @openpkg-ts/adapters | Framework adapters (Fumadocs, Docusaurus, Mintlify). |

### Use Cases

- Generate API documentation automatically from TypeScript
- Detect breaking changes between versions
- Build custom documentation sites
- Integrate with existing doc frameworks

---

## doccov

Documentation coverage and drift detection for TypeScript.

### Install

```bash
npm install -g @doccov/cli
```

### CLI Commands

```bash
# Generate spec (outputs to .doccov/{package}/)
doccov spec

# Check coverage (fail if below threshold)
doccov check --min-coverage 80

# Auto-fix drift issues
doccov check --fix
```

### Badges

Add a documentation health badge to your README:

```markdown
![Docs](https://api.doccov.com/badge/YOUR_ORG/YOUR_REPO?path=.doccov/your-package/doccov.json)
```

For scoped packages:
```markdown
![Docs](https://api.doccov.com/badge/YOUR_ORG/YOUR_REPO?path=.doccov/@your-org/pkg/doccov.json)
```

Requires `.doccov/{package}/doccov.json` committed to your default branch.

### Packages

| Package | Purpose |
|---------|---------|
| @doccov/spec | DocCov spec schema, validation |
| @doccov/sdk | Core SDK |
| @doccov/cli | CLI tool |

### Dependencies

Uses openpkg-ts under the hood for TypeScript extraction.

### Use Cases

- Enforce documentation coverage in CI
- Track documentation drift over time
- Display health badges on repos

---

## secondlayer

Type-safe contract interfaces, functions, and React hooks for Clarity smart contracts.

### Install

```bash
bun add -g @secondlayer/cli
```

### CLI Commands

```bash
# Generate from local .clar files
secondlayer generate ./contracts/token.clar -o ./src/generated.ts

# Generate from deployed contracts (network inferred from address)
secondlayer generate SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.alex-vault -o ./src/generated.ts

# Glob patterns
secondlayer generate "./contracts/*.clar" -o ./src/generated.ts

# With config file
secondlayer init   # creates secondlayer.config.ts
secondlayer generate
```

### Config File

```typescript
// secondlayer.config.ts
import { defineConfig } from '@secondlayer/cli'
import { clarinet, actions, react } from '@secondlayer/cli/plugins'

export default defineConfig({
  out: 'src/generated.ts',
  plugins: [
    clarinet(),  // parse local Clarinet project
    actions(),   // add read/write helpers
    react(),     // generate React hooks
  ],
})
```

### Generated Usage

#### Contract Calls

```typescript
import { token } from './generated/contracts'
import { makeContractCall, fetchCallReadOnlyFunction } from '@stacks/transactions'

// Works with @stacks/transactions directly
await makeContractCall({
  ...token.transfer({ amount: 100n, recipient: "SP..." }),
  network: 'mainnet',
})

await fetchCallReadOnlyFunction({
  ...token.getBalance({ account: "SP..." }),
  network: 'mainnet',
})
```

#### Read/Write Helpers (requires actions plugin)

```typescript
// Read-only
const balance = await token.read.getBalance({ account: "SP..." })

// Write (uses STX_SENDER_KEY env var)
await token.write.transfer({ amount: 100n, recipient: "SP..." })

// Or pass senderKey explicitly
await token.write.transfer({ amount: 100n, recipient: "SP..." }, "<sender-key>")
```

#### Contract State

```typescript
// Maps
const balance = await token.maps.balances.get("SP...")

// Variables
const supply = await token.vars.totalSupply.get()

// Constants
const max = await token.constants.maxSupply.get()
```

#### React Hooks (requires react plugin)

```typescript
import { useTokenTransfer, useTokenBalances } from './generated/hooks'

function App() {
  const { transfer, isRequestPending } = useTokenTransfer()
  const { data: balance } = useTokenBalances("SP...")

  return (
    <button onClick={() => transfer({ amount: 100n, recipient: "SP..." })}>
      Transfer
    </button>
  )
}
```

### Plugins

| Plugin | Description |
|--------|-------------|
| clarinet() | Parse local Clarinet project |
| actions() | Add `read`/`write` helpers |
| react() | Generate React hooks |
| testing() | Generate Clarinet SDK test helpers |

### Network Inference

Address prefix determines network:
- `SP`/`SM` → mainnet
- `ST`/`SN` → testnet

### Use Cases

- Type-safe Clarity contract interactions
- Generate React hooks for dApps
- Testing with Clarinet SDK
- Direct integration with @stacks/transactions
