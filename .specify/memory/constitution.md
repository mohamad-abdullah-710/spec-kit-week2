<!--
SYNC IMPACT REPORT
==================
Version change: (unversioned template) → 1.0.0
Bump rationale: Initial ratification — first concrete constitution replacing the blank template.

Modified principles (template placeholder → new title):
  - [PRINCIPLE_1_NAME] → I. Code Quality Is Non-Negotiable
  - [PRINCIPLE_2_NAME] → II. Test-First Development (NON-NEGOTIABLE)
  - [PRINCIPLE_3_NAME] → III. Comprehensive, Layered Testing
  - [PRINCIPLE_4_NAME] → IV. Maintainability & Simplicity
  - [PRINCIPLE_5_NAME] → V. Documentation & Readability

Added sections:
  - Quality Standards (was [SECTION_2_NAME])
  - Development Workflow & Quality Gates (was [SECTION_3_NAME])
  - Governance (filled)

Removed sections: none

Templates reviewed (read at runtime; not modified by this command):
  - .specify/templates/plan-template.md — "Constitution Check" gate derives from this file ✅
  - .specify/templates/spec-template.md — no conflicting mandates ✅
  - .specify/templates/tasks-template.md — test-first ordering aligns with Principle II ✅

Follow-up TODOs:
  - Project name inferred from repository directory ("spec-kit-week2"); rename if the
    product gets a formal name.
  - Tooling-specific thresholds (linter, formatter, coverage tool) are stack-agnostic until
    the technology stack is chosen in /speckit-plan.
-->

# Spec Kit Week 2 Constitution

## Core Principles

### I. Code Quality Is Non-Negotiable

- All code MUST pass the project's configured linter and formatter with zero errors before merge;
  warnings MUST NOT be suppressed without an inline justification comment.
- Static type checking MUST be enabled where the language supports it, and new code MUST NOT
  introduce untyped or `any`-equivalent escapes without justification.
- Functions MUST have a single, clear responsibility. Functions exceeding ~50 lines or a
  cyclomatic complexity of 10 MUST be refactored or justified in review.
- Dead code, commented-out code, and unused dependencies MUST be removed, not left behind.
- Errors MUST be handled explicitly; silently swallowing exceptions is prohibited.
- Duplicated logic appearing in three or more places MUST be extracted into a shared unit.

**Rationale**: Consistent, automatically enforced quality keeps the codebase predictable and
reduces review effort and defect rates over the project's lifetime.

### II. Test-First Development (NON-NEGOTIABLE)

- For every feature and bug fix, tests MUST be written before the implementation and MUST be
  observed failing first (Red → Green → Refactor).
- Every bug fix MUST include a regression test that reproduces the defect.
- Implementation MUST NOT be considered complete until all its tests pass.
- Refactoring MUST occur only under a passing test suite.

**Rationale**: Writing tests first forces clear requirements, produces testable designs, and
guarantees that every behavior is verified rather than assumed.

### III. Comprehensive, Layered Testing

- **Unit tests** MUST cover all business logic, in isolation from I/O and external services.
- **Integration tests** MUST cover module boundaries, persistence, external service contracts,
  and any change to a shared schema or public interface.
- **Contract tests** MUST exist for every public API or CLI interface.
- Line coverage on new or changed code MUST be at least 80%; critical paths (data integrity,
  security, payments, authentication) MUST be at 100% branch coverage.
- Tests MUST be deterministic, independent of execution order, and free of real network or
  clock dependencies unless explicitly marked as integration/end-to-end.
- Flaky tests MUST be fixed or quarantined with a tracking issue within one working day;
  they MUST NOT be silently retried or ignored.
- The full test suite MUST pass in CI before any merge.

**Rationale**: Each test layer catches a different class of defect; coverage floors and
determinism keep the suite trustworthy as a safety net.

### IV. Maintainability & Simplicity

- Start with the simplest design that satisfies the current requirements (YAGNI). Speculative
  abstractions, configuration, or extension points MUST NOT be added without a concrete need.
- Modules MUST have clear boundaries and explicit, minimal public interfaces; internal details
  MUST NOT leak across module boundaries.
- Dependencies MUST point inward toward core logic; core logic MUST NOT depend on frameworks,
  UI, or infrastructure details directly.
- New third-party dependencies MUST be justified (purpose, maintenance status, license) in the
  plan or PR description.
- Any added complexity that violates these rules MUST be recorded in the plan's Complexity
  Tracking table with the simpler alternative that was rejected and why.

**Rationale**: Simple, loosely coupled code is cheaper to change, easier to test, and easier
for new contributors to understand.

### V. Documentation & Readability

- Names (variables, functions, modules) MUST reveal intent; abbreviations are allowed only when
  they are standard in the domain.
- Comments MUST explain *why*, not *what*; code that needs a *what* comment SHOULD be rewritten
  to be self-explanatory.
- Every public interface MUST document its inputs, outputs, and error behavior.
- The README MUST describe how to set up, run, and test the project, and MUST be updated in the
  same change that alters any of those steps.
- Significant architectural decisions MUST be captured in the feature's plan or research notes.

**Rationale**: Code is read far more often than it is written; readable code and accurate docs
are the primary drivers of long-term maintainability.

## Quality Standards

- **Automated enforcement**: Linting, formatting, type checking, and tests MUST run in CI on
  every pull request and MUST block merge on failure.
- **Coverage reporting**: CI MUST publish coverage for every pull request; coverage on changed
  code MUST NOT fall below the thresholds in Principle III.
- **Dependency hygiene**: Dependencies MUST be pinned via a lockfile and reviewed for known
  vulnerabilities before release.
- **Technical debt**: Known shortcuts MUST be tracked as issues with a `TODO(<issue-id>)` marker
  in code; untracked `TODO`s are not permitted.

## Development Workflow & Quality Gates

1. **Specify** (`/speckit-specify`): Requirements MUST be testable and unambiguous.
2. **Plan** (`/speckit-plan`): The plan MUST pass the Constitution Check against every principle
   above before design begins, and again after design.
3. **Tasks** (`/speckit-tasks`): Test tasks MUST be ordered before their implementation tasks.
4. **Implement** (`/speckit-implement`): Follow Red → Green → Refactor; commit in small,
   reviewable increments.
5. **Review**: Every change MUST be reviewed by at least one other contributor (or an explicit
   self-review checklist for solo work) that verifies compliance with this constitution.
   Pull requests SHOULD stay under ~400 changed lines to remain reviewable.
6. **Merge**: Only when all CI gates pass and review is approved.

## Governance

- This constitution supersedes all other development practices and conventions in this project.
  Where guidance conflicts, this document wins.
- **Amendments** MUST be proposed as a documented change to this file, include a rationale and
  a migration plan for existing code if needed, and update the Sync Impact Report.
- **Versioning** follows semantic versioning:
  - MAJOR: Removal or backward-incompatible redefinition of a principle or governance rule.
  - MINOR: A new principle or section, or materially expanded guidance.
  - PATCH: Clarifications, wording, or typo fixes with no semantic change.
- **Compliance review**: Every plan and pull request MUST verify compliance with these
  principles. Deviations MUST be justified in the plan's Complexity Tracking table; unjustified
  violations block merge.
- The constitution SHOULD be reviewed for relevance at least once per major release.

**Version**: 1.0.0 | **Ratified**: 2026-10-07 | **Last Amended**: 2026-10-07
