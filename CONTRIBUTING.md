# Contribution Guidelines

This document outlines the contribution guidelines and Git workflow for the Book Tracking System project.

## Git Branching Strategy

We follow a Git workflow based on GitFlow but simplified for this project's needs. It revolves around a `main` branch for releases, a `dev` branch for integration, and feature branches for development.

### `main` Branch

- The `main` branch represents the official, production-ready release history.
- It is protected. All merges into `main` **must** be done via Pull Requests from the `dev` branch and only during a release.
- Direct commits to `main` are strictly forbidden.
- Each merge to `main` should be tagged with a version number (e.g., `v1.0.0`).

### `dev` Branch

- The `dev` branch is the primary development branch where all feature branches are merged.
- It contains the latest, integrated code that is being prepared for the next release.
- All feature branches must be created from `dev`.

### Feature Branches

- All new features and bug fixes must be developed in separate branches.
- Branch names should be descriptive and follow this convention:
  - For new features: `feature/<feature-name>` (e.g., `feature/user-authentication`)
  - For bug fixes: `fix/<bug-name>` (e.g., `fix/heatmap-rendering-issue`)
- Branches should be created from the latest version of the `dev` branch.

## Pull Request (PR) Process

1.  **Create a branch:** Start by creating a new feature or fix branch from `dev`.
2.  **Develop:** Make your code changes, following the project's coding standards.
3.  **Commit:** Use clear and conventional commit messages (see below).
4.  **Push:** Push your branch to the remote repository.
5.  **Create a Pull Request:** Open a Pull Request from your branch to the `dev` branch.
6.  **Review:** At least one other team member must review and approve the PR.
7.  **Merge:** Once approved, the PR can be merged into `dev`.

## Commit Message Convention

We use the [Conventional Commits](https://www.conventionalcommits.org/) specification. This helps in automating changelogs and makes the commit history more readable.

Each commit message should be in the format: `<type>: <description>`

- **`feat`**: A new feature.
- **`fix`**: A bug fix.
- **`docs`**: Changes to documentation.
- **`style`**: Code style changes (formatting, etc.).
- **`refactor`**: A code change that neither fixes a bug nor adds a feature.
- **`test`**: Adding or correcting tests.
- **`chore`**: Changes to the build process or auxiliary tools.

**Example:**
`feat: Add user login endpoint`
`fix: Correct calculation for average pages per day`
