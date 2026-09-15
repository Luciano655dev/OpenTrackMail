# Manual end-to-end testing

## Core flow

- [ ] Marketing home, Privacy, and Terms render on desktop, tablet, and mobile widths.
- [ ] Load the unpacked extension and note its extension ID.
- [ ] Add its Chromium redirect URL to Supabase Auth.
- [ ] Sign in from the popup with the same Google account used by Gmail.
- [ ] Confirm the popup shows the account and Tracking ON.
- [ ] Open Gmail and create two compose windows. Confirm each has its own Track email toggle.
- [ ] Turn tracking off in one compose. Confirm the other remains on.
- [ ] Add recipient, subject, and body, then send the tracked message.
- [ ] Confirm the dashboard is local while `TRACKING_PIXEL_ORIGIN` and extension `VITE_API_URL` use the active Cloudflare HTTPS tunnel.
- [ ] Send a tracked message and confirm the temporary session rule prevents the sender Gmail tab from creating an open event.
- [ ] Confirm the first pixel request is stored as `early_automatic` and the message remains at one check.
- [ ] Open the message from the recipient and confirm the next distinct request becomes the first displayed open.
- [ ] Confirm same-source requests within 10 seconds are stored as `rapid_duplicate` without increasing the displayed count.
- [ ] Inspect the received HTML and confirm exactly one invisible `data-opentrackmail-pixel` image exists.
- [ ] Open Gmail Sent. Confirm one gray check appears for the tracked message and no icon appears for the untracked message.
- [ ] Navigate Inbox → Sent without reloading. Confirm the status icon remains single and is not duplicated.
- [ ] Open the tracked message from a second account/device with remote images enabled.
- [ ] Confirm `/t/<opaque-id>.gif` returns status 200, `image/gif`, and a 34-byte image quickly.
- [ ] Wait up to 60 seconds or refocus Gmail. Confirm the status changes to two blue checks.
- [ ] Hover the checks and confirm the tooltip includes count, first open, and last open.
- [ ] Open the popup and confirm the message appears in Recent.
- [ ] Open the dashboard and confirm totals, row status, count, and last-opened value.
- [ ] Open the detail page and confirm Sent and Open detected activity entries.

## Security and edge cases

- [ ] Request an authenticated API route with no token and confirm HTTP 401.
- [ ] Use user A's token to request user B's email UUID and confirm HTTP 404.
- [ ] Request unknown and malformed pixel IDs; both must return the transparent GIF and create no event.
- [ ] Request the same valid pixel several times inside 10 seconds; raw duplicate rows may exist but the visible count increases once.
- [ ] Request it again after 10 seconds; the visible count increases again.
- [ ] Expire the access token, then use the extension; confirm refresh succeeds without another sign-in.
- [ ] Revoke/invalidates the refresh token; confirm the extension returns to signed-out state instead of looping.
- [ ] Try sending with tracking while signed out; Gmail send stays paused and the control shows an error. Turning tracking off permits a normal send.
- [ ] Send with multiple recipients; all addresses should be stored, but no email body should be stored.
- [ ] Reply and forward: verify basic compose detection; treat status association as best-effort.
- [ ] Discard a draft; confirm no record was created unless Send was clicked.
- [ ] Delete one record, all history, and finally an account; verify cascading event deletion.
