# IMAP Email Tool

Read, search, and draft emails via IMAP. Does NOT mark emails as read — completely transparent.

## Usage

```bash
# List recent emails
node /workspace/tools/imap-cli.js recent 20

# Search emails
node /workspace/tools/imap-cli.js search "invoice"

# Read a specific email by UID (from recent/search output)
node /workspace/tools/imap-cli.js read 12345

# Save a draft (NOT sent — goes to Drafts folder)
node /workspace/tools/imap-cli.js draft "recipient@example.com" "Subject line" "Email body text"
```

## Notes
- Output from `recent` and `search` includes UIDs — use those with `read`
- Drafts are saved to the Drafts folder, never sent automatically
- Connected to Fastmail (jbouaziz@fastmail.com)
