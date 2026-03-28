---
name: newsletter-draft
description: Generate Umamy product newsletter drafts from GitHub changes and save as Gmail drafts. Use when user asks to draft a newsletter, write an update email, or generate product updates.
allowed-tools: Bash(gh:*), Bash(gog:*)
---

# Umamy Newsletter Generator

Generate newsletter drafts by analyzing shipped features from GitHub and writing drafts following Umamy's tone and guidelines. Save as Gmail draft for review.

## Workflow

### Step 1: Find Baseline (Last Newsletter)

Search Gmail for the most recent newsletter sent:

```bash
gog gmail search --query "from:jonathan@rs.umamy.io" --max-results 1
```

Extract the sent date — this is the baseline. If not found, ask the user for a date.

### Step 2: Fetch GitHub Changes

Get all merged PRs and commits to `main` since baseline:

```bash
# Merged PRs since baseline
gh pr list -R umamy-io/umamy-web --state merged --search "merged:>YYYY-MM-DD" --json number,title,body,mergedAt,author --limit 100

# Commits since baseline
gh api repos/umamy-io/umamy-web/commits --jq '.[] | "\(.sha[0:7]) \(.commit.message | split("\n")[0])"' -f since=YYYY-MM-DDT00:00:00Z
```

Also check `umamy-io/umamy-backend` and `umamy-io/umamy-aws-backend` for backend changes that have user-facing impact.

### Step 3: Analyze & Filter

The newsletter is for **end users** of Umamy — recruiters, founders, hiring managers who use the product daily. They care about what they can see and interact with, not backend plumbing.

**Include:**
- New UI features and UX improvements users interact with
- Workflow changes that save users time
- New integrations users can connect (ATS, LinkedIn, etc.)
- Performance improvements users actually feel (faster search, faster page loads)
- Critical bug fixes that were affecting users

**Exclude:**
- Backend infrastructure (data lakes, analytics pipelines, fan-out architecture, Lambda changes)
- Security/platform policies users never see (email blocking at signup, auth changes)
- Internal refactors, dependency bumps, CI/CD changes
- Code cleanup, build system changes
- Admin/ops tooling
- Draft/WIP commits that were reverted
- Anything where the user wouldn't notice a difference in the product

**Rule of thumb:** If a user can't see it, click it, or feel it in the product — it doesn't go in the newsletter.

Group related commits (feature + follow-up fixes). Identify feature categories:
- **Major feature** — new capability, workflow unlock
- **Improvement** — enhancement to existing feature
- **Integration** — ATS, API, third-party
- **UX polish** — filters, layout, performance
- **Bug fix** — only if critical and user-visible

### Step 4: Prioritize

Order by user impact:
1. Most visible features first
2. Workflow improvements
3. New capabilities
4. Polish/incremental

If 3+ small related features, group under "Other Improvements".

### Step 5: Present TLDR for Approval

Before writing the full draft, present the user with a **numbered** list so they can easily reply with the order they want or tell you which ones to drop:

```
Here's what I found since the last newsletter (DATE):

1. [Emoji] **Feature name** — Short description
2. [Emoji] **Feature name** — Short description
3. [Emoji] **Feature name** — Short description
4. [Emoji] **Feature name** — Short description
5. [Emoji] **Feature name** — Short description

Reply with the order you want (e.g. "3, 1, 5") or tell me which to drop. I'll draft the full newsletter after.
```

The numbers are only for the review step — they get removed in the final newsletter draft (TLDR uses bullet points, not numbers).

**Wait for user approval before proceeding to the full draft.**

### Step 6: Write Full Newsletter

Follow this exact structure:

The email body starts with metadata (subject lines, preview text) for the user to pick from, then the actual email content. The TLDR comes **inside the email body**, right after the intro and before the feature sections.

#### Metadata (for user to pick from, not part of the email)

```markdown
# Newsletter — [Month Year]

## Subject Line Options:
1. [Casual, specific, 40-60 chars]
2. [Alternative]
3. [Alternative]
4. [Alternative]

## Preview Text:
[Single sentence, 70-80 chars, summarizes key features with em-dashes]
```

#### Email Body

The email itself follows this order:

```markdown
TLDR
[Emoji] **Feature name** — Short description under 100 chars
[Emoji] **Feature name** — Short description under 100 chars
[Emoji] **Feature name** — Short description under 100 chars
[Emoji] **Feature name** — Short description under 100 chars

Hey! 👋

[1-2 short sentences. Context + what shaped this batch of features. Keep it tight.]

Here's what's new:
```

**TLDR placement is critical.** It goes at the very top of the email, before "Hey!". Users love scanning it first. No bullet dashes — just emoji + bold name + em-dash + description, one per line. See the reference example below.

#### Feature Sections (3-5 sections)

Each section:

```markdown
[Emoji] [Feature Name]

[📸 SCREENSHOT/GIF: Description of what visual should show]

[Hook or 1-2 sentence explanation. Can be a pain point ("Tired of X?") or just a direct description of what changed. Don't force a hook if a straight description works better.]

[What's different / What it does / What's better — pick the label that fits:]
- Benefit-focused bullet (under 80 chars)
- Benefit-focused bullet
- Benefit-focused bullet

**Why it matters:** [Single sentence — the so-what]

[CTA link text → {{{contact.organization_url}}}/path]
```

**Tone notes from real newsletters:**
- Hooks are optional. Sometimes a straight description ("We rebuilt umamy.io from scratch.") is better than a forced pain-point question.
- Use "What's different:" / "What's better:" / "What it does:" — whatever fits the feature naturally. Don't always use the same label.
- Keep explanations tight. 1-2 sentences max before the bullets.
- CTAs are simple link text, not bold bracketed blocks. Example: "Try the filters" or "Check out the new website"

#### What's Coming Next

Ask the user what upcoming features to mention. Include beta tester callouts. Can also include reminders about existing offerings (like white-glove service):

```markdown
What's Coming Next

[We're working on... / Brief intro sentence]

[Emoji] [Upcoming Feature]
[1-2 sentences. What problem it solves. Can include a screenshot if relevant.]

**Looking for beta testers.** [Reply to this email](mailto:jonathan@umamy.io?subject=Feature%20beta) if you want early access.

[Optional: reminder about white-glove service or other existing offerings]
```

#### Closing

```markdown
Keep Building Together

Thanks for the feedback that shaped these features. We read every reply and use your input to decide what to build next.

Got thoughts on what we shipped? Ideas for what's next? **Just hit reply.**

Happy hiring, The Umamy Team

P.S. If you run into any issues, just reply to this email. We read every message.
```

**Note:** No "Try the new features" CTA link at the closing — each feature section already has its own CTA. The closing is just the sign-off.

### Step 7: Create Gmail Draft

After user approves the full draft, save it as a Gmail draft:

```bash
gog gmail draft create --from "jonathan@rs.umamy.io" --subject "SUBJECT" --body "HTML_BODY"
```

Convert markdown to email-safe HTML. Keep screenshot placeholders visible as `[📸 SCREENSHOT: ...]` so the user can add them manually.

Confirm:
```
Newsletter draft created in Gmail (jonathan@rs.umamy.io).

Next steps:
1. Review draft in Gmail
2. Add screenshots where marked with 📸
3. Fill in "What's Coming Next" if needed
4. Send when ready
```

## Tone & Voice Rules

- Casual, direct, founder-to-user — like a colleague sharing what they built
- Short sentences. Contractions. No filler.
- Describe what changed, not how amazing it is
- Hooks are optional — a straight description often works better than a forced question
- Acknowledge feedback when genuine, don't shoehorn it in every section
- No markdown formatting overkill — keep headers, bold, bullets simple and clean

**Good examples from real newsletters:**
- "We rebuilt umamy.io from scratch."
- "We've been busy shipping."
- "Two new filters to find exactly who you need, fast."
- "Define your criteria once, see only the right profiles."

**Bad — avoid:**
- "We're excited to announce..." (corporate)
- "Revolutionary new feature..." (hyperbolic)
- "Lightning-Fast Pipelines" as a section title (too marketing-y — prefer "Faster pipelines" or "Pipeline performance")
- Overusing bold, brackets, and emoji in CTAs (keep CTAs as plain link text)

## Length Guidelines

- TLDR: 3-5 bullets (at the very top of the email, before "Hey!")
- Intro: 1-2 short sentences (not paragraphs — keep it tight)
- Feature sections: 3-5 sections, 80-150 words each
- Total: 600-1000 words
- Don't pad — shorter is better if there are fewer features

## Subject Line Rules

- Casual, not corporate
- Specific — mention 1-2 key features
- 40-60 characters
- No emoji unless it feels natural

## Reference

Look up past newsletters in Gmail for tone reference:
```bash
gog gmail search --query "from:jonathan@rs.umamy.io" --max-results 5
```
