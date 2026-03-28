#!/usr/bin/env node
// Generic IMAP CLI tool for NanoClaw agents
// Usage: node imap-cli.js <command> [args...]
// Commands: recent [count], search <query>, read <uid>, draft <to> <subject> <body>
// Config via env: IMAP_HOST, IMAP_PORT (default 993), IMAP_USER, IMAP_PASS

const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');

const config = {
  host: process.env.IMAP_HOST,
  port: parseInt(process.env.IMAP_PORT || '993', 10),
  auth: {
    user: process.env.IMAP_USER,
    pass: process.env.IMAP_PASS,
  },
  secure: true,
  logger: false,
};

if (!config.host || !config.auth.user || !config.auth.pass) {
  console.error('Missing IMAP config. Set IMAP_HOST, IMAP_USER, IMAP_PASS env vars.');
  process.exit(1);
}

async function connect() {
  const client = new ImapFlow(config);
  await client.connect();
  return client;
}

function formatEnvelope(msg) {
  const date = msg.envelope?.date ? new Date(msg.envelope.date).toISOString() : '';
  const from = msg.envelope?.from?.map(a => `${a.name || ''} <${a.address}>`).join(', ') || '';
  const subject = msg.envelope?.subject || '(no subject)';
  const flags = [...(msg.flags || [])].join(', ');
  return `UID:${msg.uid} | ${date} | From: ${from} | Subject: ${subject} | Flags: ${flags}`;
}

async function recent(count = 10) {
  const client = await connect();
  try {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const messages = [];
      const total = client.mailbox.exists;
      if (total === 0) { console.log('Inbox is empty.'); return; }
      const from = Math.max(1, total - count + 1);
      for await (const msg of client.fetch(`${from}:*`, { envelope: true, flags: true })) {
        messages.push(formatEnvelope(msg));
      }
      console.log(messages.join('\n'));
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

async function search(query) {
  const client = await connect();
  try {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const uids = await client.search({ or: [{ subject: query }, { from: query }, { body: query }] });
      if (uids.length === 0) { console.log('No results.'); return; }
      const slice = uids.slice(-20);
      const messages = [];
      for await (const msg of client.fetch(slice, { envelope: true, flags: true, uid: true })) {
        messages.push(formatEnvelope(msg));
      }
      console.log(`${uids.length} results (showing last ${slice.length}):\n`);
      console.log(messages.join('\n'));
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

async function read(uid) {
  const client = await connect();
  try {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const msg = await client.fetchOne(parseInt(uid, 10), { source: true, envelope: true }, { uid: true });
      if (!msg) { console.error(`Message UID ${uid} not found.`); return; }
      const parsed = await simpleParser(msg.source);
      console.log(`From: ${parsed.from?.text || ''}`);
      console.log(`To: ${parsed.to?.text || ''}`);
      console.log(`Date: ${parsed.date?.toISOString() || ''}`);
      console.log(`Subject: ${parsed.subject || ''}`);
      console.log(`\n${parsed.text || parsed.html || '(no body)'}`);
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

async function draft(to, subject, body) {
  const client = await connect();
  try {
    const from = config.auth.user;
    const date = new Date().toUTCString();
    const raw = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `Date: ${date}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=utf-8`,
      '',
      body,
    ].join('\r\n');

    await client.append('Drafts', raw, ['\\Draft', '\\Seen']);
    console.log(`Draft saved: To=${to}, Subject="${subject}"`);
  } finally {
    await client.logout();
  }
}

// CLI dispatch
const [,, command, ...args] = process.argv;

(async () => {
  try {
    switch (command) {
      case 'recent':
        await recent(parseInt(args[0] || '10', 10));
        break;
      case 'search':
        if (!args[0]) { console.error('Usage: search <query>'); process.exit(1); }
        await search(args.join(' '));
        break;
      case 'read':
        if (!args[0]) { console.error('Usage: read <uid>'); process.exit(1); }
        await read(args[0]);
        break;
      case 'draft':
        if (args.length < 3) { console.error('Usage: draft <to> <subject> <body>'); process.exit(1); }
        await draft(args[0], args[1], args.slice(2).join(' '));
        break;
      default:
        console.log(`IMAP CLI — Commands:
  recent [count]              List recent emails (default 10)
  search <query>              Search emails by subject/from/body
  read <uid>                  Read a specific email by UID
  draft <to> <subject> <body> Save a draft email`);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
})();
