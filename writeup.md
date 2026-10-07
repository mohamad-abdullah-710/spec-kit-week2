# Week 2 Writeup: Quote of the Day with Spec Kit

## Prompts I gave each skill
1. `/speckit-constitution Create principles focused on code quality, testing, and maintainability.`
2. `/speckit-specify A quote-of-the-day page: one random quote from a built-in list, a "New quote" button, and favoriting that persists across reloads.`
3. `/speckit-plan Use plain HTML/CSS/JavaScript, no backend; persist favorites in localStorage.`
4. `/speckit-plan Refine the plan to keep it simple: this is a small single-page assignment. Remove ESLint, Prettier, TypeScript, jsdom and the GitHub Actions CI workflow. Keep unit tests for the quote picker and favorites store using Node's built-in test runner, with zero npm dependencies. Record any deviation from the constitution in Complexity Tracking.`
5. `/speckit-tasks`
6. `/speckit-implement` (run twice)
7. `/speckit-converge` (run twice)

## Refinement: before and after

### Spec refinement (commit f0c3961)
The AI's first spec asked for at least 20 quotes, but the assignment only asks for a small list. I edited spec.md myself: FR-013 went from 20 to 10 quotes, and SC-003 from 15 to 8 distinct quotes. This change flowed through every later stage: the data model says "at least 10 quotes", and the code has a unit test called "has at least 10 quotes".

### Plan refinement (commit 77a80be → 4863da3)
- **Before:** the plan added 6 dev tools (ESLint, Prettier, TypeScript, jsdom and two helpers), a GitHub Actions CI workflow and strict coverage gates. The Complexity Tracking table said "No violations", because the plan followed my heavy constitution exactly.
- **After:** I re-ran /speckit-plan with a simpler prompt. The new plan has zero npm dependencies and no CI. Complexity Tracking now lists four deviations (D1–D4), each with a reason and a mitigation. The diff was 162 insertions and 181 deletions, so the plan got smaller.
- **Effect on output:** tasks.md told the agent not to add a linter, a type checker, DOM tests or CI, and the final code has no dependencies. Page behaviour is checked with manual quickstart scenarios instead of automated DOM tests.
- **Human fix:** the AI wrote twice that the project "isn't a git repository", which was wrong. I corrected it by hand in plan.md and research.md, and the next stage (tasks.md) used my correction.

## Convergence outcome
- **Round 1: not converged.** It found 3 gaps: T031 (critical) the dev server crashed on a malformed URL; T032 screen readers re-read the quote on every favorite change; T033 a private helper function was exported.
- I ran /speckit-implement again, which fixed all three.
- **Round 2: Converged** with 0 findings. 35 tests pass with 100% line and branch coverage.
- I checked the page in a browser: random quote, New quote, favoriting, reload persistence and Remove all work. The DevTools edge cases (scenarios 9–12) are covered by unit tests only.

## What I learned
Spec-driven development felt like overhead at the start: my constitution asked for CI, linting and coverage tools that a one-page site does not need, and that complexity went straight into the first plan. It paid off later, because every stage was written down and could be reviewed and changed, so refining the spec and plan changed the code without me touching it. The converge step was the most useful part: it found a real crash that the tests did not cover. I also learned that I must review AI output carefully, because it invented a fake quote and wrongly said my project was not a git repository.