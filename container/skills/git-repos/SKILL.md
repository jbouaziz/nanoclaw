---
name: git-repos
description: Manage GitHub repositories using the gh CLI. Query repos, PRs, issues, releases, workflows, and more. Use when the user asks about their repos, PRs, issues, CI status, or any GitHub operations.
---

# GitHub Repository Management

Manage GitHub repositories using the `gh` CLI. This skill covers querying, creating, and managing repos, PRs, issues, releases, and CI/CD workflows.

## Prerequisites

- `gh` CLI installed and authenticated (`gh auth status` to verify)
- Git configured with user identity

## Quick Reference

### Repos

```bash
# List your repos
gh repo list

# List repos for an org
gh repo list <org>

# View current repo info
gh repo view

# Clone a repo
gh repo clone <owner>/<repo>

# Create a new repo
gh repo create <name> --public/--private

# Fork a repo
gh repo fork <owner>/<repo>

# Delete a repo (requires confirmation)
gh repo delete <owner>/<repo> --yes
```

### Pull Requests

```bash
# List open PRs
gh pr list

# List PRs with filters
gh pr list --state=closed --author=@me --label=bug

# View PR details
gh pr view <number>

# View PR diff
gh pr diff <number>

# Create a PR
gh pr create --title "title" --body "description"

# Merge a PR
gh pr merge <number> --squash/--merge/--rebase

# Check out a PR locally
gh pr checkout <number>

# Review a PR
gh pr review <number> --approve/--request-changes --body "comment"

# List PR comments
gh api repos/<owner>/<repo>/pulls/<number>/comments
```

### Issues

```bash
# List open issues
gh issue list

# List with filters
gh issue list --assignee=@me --label=bug --milestone="v1.0"

# View an issue
gh issue view <number>

# Create an issue
gh issue create --title "title" --body "description" --label=bug

# Close an issue
gh issue close <number>

# Reopen
gh issue reopen <number>

# Add comment
gh issue comment <number> --body "comment"
```

### CI/CD & Actions

```bash
# List recent workflow runs
gh run list

# View a specific run
gh run view <run-id>

# View run logs
gh run view <run-id> --log

# Watch a run in progress
gh run watch <run-id>

# Re-run a failed workflow
gh run rerun <run-id>

# List workflows
gh workflow list

# Trigger a workflow
gh workflow run <workflow-name>
```

### Releases

```bash
# List releases
gh release list

# View latest release
gh release view --latest

# Create a release
gh release create <tag> --title "title" --notes "description"

# Upload assets to a release
gh release upload <tag> <file>

# Delete a release
gh release delete <tag> --yes
```

### GitHub API (Advanced)

For anything not covered by built-in commands, use the API directly:

```bash
# GET request
gh api repos/<owner>/<repo>

# POST request
gh api repos/<owner>/<repo>/issues -f title="Bug" -f body="Details"

# GraphQL query
gh api graphql -f query='
  query {
    viewer {
      repositories(first: 10, orderBy: {field: UPDATED_AT, direction: DESC}) {
        nodes { nameWithOwner, stargazerCount, updatedAt }
      }
    }
  }
'

# Paginate results
gh api repos/<owner>/<repo>/issues --paginate

# JSON output with jq filtering
gh api repos/<owner>/<repo>/contributors --jq '.[].login'
```

### Notifications & Stars

```bash
# View notifications
gh api notifications --jq '.[] | "\(.subject.type): \(.subject.title)"'

# Star a repo
gh api user/starred/<owner>/<repo> -X PUT

# List starred repos
gh api user/starred --jq '.[].full_name'
```

### Gists

```bash
# List your gists
gh gist list

# Create a gist
gh gist create <file> --public --desc "description"

# View a gist
gh gist view <id>
```

## Workflow

1. **When the user asks about repos/PRs/issues** -- run the appropriate `gh` command
2. **Format output clearly** -- summarize results, don't dump raw JSON unless asked
3. **For bulk operations** -- confirm with the user before executing destructive actions (delete, close, merge)
4. **For cross-repo queries** -- use `gh api graphql` for efficient batched lookups
5. **Always specify the repo** when not inside the target repo: `gh <command> -R <owner>/<repo>`

## Tips

- Use `--json` flag with `--jq` for structured output: `gh pr list --json number,title,author --jq '.[] | "#\(.number) \(.title) by \(.author.login)"'`
- Use `-R owner/repo` to target a specific repo without cd'ing into it
- Use `gh auth switch` if you have multiple GitHub accounts
- `gh api` supports pagination with `--paginate` for large result sets
