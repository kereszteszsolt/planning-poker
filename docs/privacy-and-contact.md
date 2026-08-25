# Planning Poker privacy and contact boundaries

## Current data boundary

Planning Poker has no account system, analytics SDK, tracking cookie, database, or durable room history in the supplied source. The backend keeps room IDs, display names, votes, moderator flags, and timestamps in process memory.

This does not make every deployment private. The following parties may still observe traffic or metadata depending on hosting:

- the browser and operating system;
- the machine running the frontend and backend;
- reverse proxies, hosting providers, and network operators;
- anyone who receives or guesses a room link;
- browser extensions or local monitoring tools.

## Safe-use guidance

- Use short display names that do not contain sensitive personal information.
- Discuss task content in the team's approved collaboration system, not in participant names or room IDs.
- Do not use the current application for credentials, customer records, health information, regulated data, or confidential incident details.
- Treat a room URL as a bearer-style access link.
- Restarting the backend removes all in-memory rooms, but logs and infrastructure outside the application may follow separate retention rules.

## Transport security

Local development uses `http://localhost:5173` and `http://localhost:3000`, so traffic is not protected by TLS. A public deployment should use HTTPS/WSS, trusted certificates, a restricted origin allowlist, secure proxy configuration, and explicit environment variables.

The application must not claim that data is always encrypted or never encrypted; transport protection depends on deployment.

## Screenshot privacy

Checked documentation images must use invented names, room IDs, and estimates. Screenshot automation must not connect to a maintainer's active room, browser profile, clipboard history, production service, or persisted application data. See [screenshots/README.md](screenshots/README.md).

## Public contact boundary

Public repository documentation may link to:

- [kereszteszsolt.hu](https://kereszteszsolt.hu/)
- [GitHub profile](https://github.com/kereszteszsolt)
- [repository issues](https://github.com/kereszteszsolt/example-planning-poker-react-express-socket-io/issues)
- [ways to support](https://kereszteszsolt.hu/ways-to-support/)

The README and documentation intentionally publish no email address. A future application contact mechanism may use runtime assembly or another anti-harvesting technique, but it must remain separate from public support instructions and must not be introduced without an explicit requirement.
