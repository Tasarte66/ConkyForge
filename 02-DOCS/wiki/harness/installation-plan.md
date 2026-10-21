# Accepted harness plan

Plan id: `db49a3cd8c1f9c030e378127a33ab0475f9cf314e2f412f4b4d3b494056967a0`

| Kind | Component | Decision | Reason | Reevaluate when |
| --- | --- | --- | --- | --- |
| agent | base-agents | deferred | No substantial software implementation is planned. | substantial software implementation is introduced |
| capability | memory | selected | Local bounded project memory supports continuity without an external account. | — |
| guard | gitmoji-guard | deferred | No selected target and project policy justify this Claude-only commit guard. | Claude Code is selected and a governed software workflow adopts the convention |
| hook | code-hooks | deferred | Code-only gates would add unrelated behavior to this project. | a substantial software workflow is accepted |
| integration | context7 | excluded | External MCP connections require a separate, provider-specific consent flow and are outside this local harness plan. | — |
| route | harness-documents | selected | The accepted profile and plan are persisted under 02-DOCS/wiki/harness/. | — |
| skill | analyze | selected | Included in the development workflow for small software. | — |
| skill | automation-strategy | selected | Included in the development workflow for small software. | — |
| skill | clarify | selected | Included in the development workflow for small software. | — |
| skill | connect-tool | selected | Included in the development workflow for small software. | — |
| skill | constitution | selected | Included in the development workflow for small software. | — |
| skill | debug | selected | Included in the development workflow for small software. | — |
| skill | decision-challenge | selected | Included in the development workflow for small software. | — |
| skill | deprecation | selected | Included in the development workflow for small software. | — |
| skill | fable-operator | selected | Included in the development workflow for small software. | — |
| skill | ftd | selected | Included in the development workflow for small software. | — |
| skill | harness | selected | Included in the development workflow for small software. | — |
| skill | idea-refinement | selected | Included in the development workflow for small software. | — |
| skill | implement | selected | Included in the development workflow for small software. | — |
| skill | init | selected | Included in the development workflow for small software. | — |
| skill | orient | selected | Included in the development workflow for small software. | — |
| skill | parallel | selected | Included in the development workflow for small software. | — |
| skill | plan | selected | Included in the development workflow for small software. | — |
| skill | review | selected | Included in the development workflow for small software. | — |
| skill | sdd-init | selected | Included in the development workflow for small software. | — |
| skill | ship | selected | Included in the development workflow for small software. | — |
| skill | simplify-code | selected | Included in the development workflow for small software. | — |
| skill | source-grounded-development | selected | Included in the development workflow for small software. | — |
| skill | specify | selected | Included in the development workflow for small software. | — |
| skill | suggest | selected | Included in the development workflow for small software. | — |
| skill | tasks | selected | Included in the development workflow for small software. | — |
| skill | ui-engineering | selected | Included in the development workflow for small software. | — |
| skill | unslop | selected | Included in the development workflow for small software. | — |
| skill | verify | selected | Included in the development workflow for small software. | — |
| skill | worktrees | selected | Included in the development workflow for small software. | — |
| workflow | sdd | deferred | The sdd skill is installed, so the chain is one request away; the practice is deferred: the software scope is small, so specification overhead is not justified yet. | multiple related features; authentication or persistence; external integrations; cross-cutting changes |
