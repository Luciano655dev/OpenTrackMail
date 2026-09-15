# Chrome Web Store submission

## Listing copy

**Name:** OpenTrackMail

**Summary:** Simple, open-source email tracking for the inboxes you already use.

**Detailed description:**

OpenTrackMail adds an optional tracking image to messages you send from Gmail. A gray check means tracking is active. Two blue checks mean the tracking image was loaded. Open the extension popup or dashboard to review recent activity. Email open tracking is not perfectly reliable because email providers can block, preload, proxy, or cache images.

## Permission justification

| Permission | Why it is required |
| --- | --- |
| `identity` | Opens Google/Supabase sign-in with Chrome's protected OAuth redirect flow. |
| `storage` | Stores the signed-in user session, default tracking preference, and a small recent-status cache locally. |
| `notifications` | Shows optional local “open detected” notifications when the user enables them. |
| `alarms` | Removes a temporary sender-tab request rule one minute after a tracked send, even when the extension service worker is sleeping. |
| `declarativeNetRequestWithHostAccess` | Blocks only the exact new tracking-pixel URL in the initiating Gmail tab while Gmail sends it, preventing the sender from creating a false open. |
| `https://mail.google.com/*` content-script match | Adds the compose toggle/pixel and renders status checks only inside Gmail. It does not request broad browsing history. |
| `https://opentrackmail.com/*` host permission | Calls only the OpenTrackMail API for tracking records and status synchronization, and scopes the sender-side pixel block to that host. Development builds use the configured HTTPS tunnel. |

No remotely hosted JavaScript, `eval`, arbitrary redirects, tabs permission, Gmail API scope, or access to other websites is used.

## Submission checklist

1. Set production `VITE_*` variables and run `npm run package -w @opentrackmail/extension`.
2. Unzip and inspect `apps/extension/opentrackmail-extension.zip`; the ZIP root must contain `manifest.json`.
3. Verify version and description in the generated manifest.
4. Add the final `chrome-extension://<store-id>` origin to `ALLOWED_EXTENSION_ORIGINS`.
5. Add `https://<store-id>.chromiumapp.org/supabase-auth` to Supabase Auth redirect URLs.
6. Use `https://opentrackmail.com/privacy` as the privacy policy URL.
7. Complete the Chrome Web Store privacy questionnaire consistently with the policy: authentication data, website content needed to add the pixel, and user activity limited to open tracking. Declare that data is not sold or used for ads.
8. Upload a 128×128 icon, a 440×280 small promo tile if requested by the store, and at least one 1280×800 or 640×400 screenshot.
9. Suggested screenshots: Gmail compose toggle on; Sent folder with single/double checks and tooltip; extension popup recent list; dashboard email table; email activity detail.
10. Capture screenshots with synthetic addresses and subjects. Do not expose real mail or credentials.
11. Test the packaged build on a clean Chrome profile before submitting.

The store may request a video demonstrating the single purpose. Show install, Google sign-in, tracked send, open detection, and dashboard history in under two minutes.
