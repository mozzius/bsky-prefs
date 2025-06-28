import { BrowserOAuthClient } from "@atproto/oauth-client-browser";

export const client = new BrowserOAuthClient({
  handleResolver: "https://bsky.social",
});
