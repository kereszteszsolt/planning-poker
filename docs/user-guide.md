# Planning Poker user guide

## What the application does

Planning Poker helps a team estimate one item at a time without showing individual choices before reveal. The application does not store a backlog or task text; the team discusses the item in another tool or call and uses this room only for estimates.

## Create a room

1. Open `http://localhost:5173` during local development.
2. Select **Create Room**.
3. Enter your display name and select **Join**.
4. The first participant becomes moderator.
5. Use **Copy Room Link** to share the exact room route, or **Copy Room ID** for teammates who prefer to paste it on the home screen.

A room link is effectively an access key in the current version. Share it only with the intended participants.

## Join an existing room

There are two supported paths:

- Open a shared `/room/<room-id>` link, enter a name, and join.
- Paste the room UUID on the home screen, select **Join Room**, then enter a name.

Names are trimmed, must contain 2-40 characters, cannot contain control characters, and are compared case-insensitively for duplicates. A room accepts at most 20 active participants by default.

## Select a value set

The moderator can choose one of four sets:

| Set | Intended use |
| --- | --- |
| Scrum | Common story-point progression with uncertainty, infinity, and break cards |
| Fibonacci | Fibonacci-style relative estimates |
| T-shirt | Qualitative XS through XXL estimates |
| Days | Coarse duration estimates in days |

Changing the value set clears all existing votes and hides the result.

## Vote and reveal

1. Each participant selects one card.
2. Before reveal, other participants can see that a vote was submitted but not its value.
3. A participant may select **Revoke Vote** to remove their vote; this hides any already revealed result.
4. When everyone has voted, the server reveals automatically.
5. The moderator may also select **Reveal Votes** before everyone votes.
6. After discussion, the moderator selects **Reset Votes** to begin another round.

For numeric votes, the current UI shows average, minimum, maximum, consensus when every numeric vote matches, and a distribution. Non-numeric cards such as `?`, `∞`, and `☕` appear in the distribution but are not included in numeric calculations. The current application does not calculate a median.

## Moderator controls

The moderator can:

- reveal or reset votes;
- change the value set;
- remove another participant;
- delegate moderator status to another participant.

When the moderator leaves, disconnects, or is removed, the longest-present eligible participant becomes moderator. Delegation always leaves exactly one moderator and cannot target the requester or a missing participant.

## Connection states

The application distinguishes initial connection, connected, reconnecting, recoverable error, lost session, and unavailable server states. A participant UUID is independent of the current socket ID. A short-lived token in `sessionStorage` lets the client request the canonical room snapshot and resume the same identity after a temporary disconnect when the room still exists. No room snapshot or vote is persisted in browser storage.

Rooms are in memory only. Restarting the backend deletes every room. Explicit leave and final disconnect delete an empty room immediately. Inactivity cleanup closes a room after one hour without updates, checked every minute by default.

## Privacy and safe use

Do not use participant names or room IDs to carry confidential information. The current application has no accounts, authentication, encryption of application payloads beyond whatever HTTPS/WSS the deployment provides, durable audit trail, or access-control list.

For public deployment, review [privacy and contact boundaries](privacy-and-contact.md) and complete the lifecycle and origin hardening in [PP-004](releases/release-0.2-experience-foundation/stories/PP-004-runtime-and-room-lifecycle-hardening.md).

## Troubleshooting

### The page stays on Connecting

- Confirm the backend is running on port `3000`.
- Confirm the frontend is running on port `5173`.
- Check both terminal windows and the browser console.
- Verify that another process is not using either port.

### A name is already taken

Choose a different name. A recovering participant uses their session token and therefore does not collide with their own previous name.

### Copy buttons fail

Clipboard access depends on browser permissions and secure-context rules. The page reports success or failure without a blocking dialog; if access fails, copy the room ID or URL manually.

### The room vanished

The backend may have restarted or the inactivity cleanup may have expired the room. Create a new room and resend its link.
