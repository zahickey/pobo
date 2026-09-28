// iOS Universal Links association file — required at exactly this path
// (no extension) for https://<domain>/e/<id> to open the app directly
// instead of the web fallback. Currently empty: we don't have an Apple
// Developer Program membership yet, so there's no Team ID / real bundle ID
// to put in `appID`. Fill in once that exists:
//
// {
//   "applinks": {
//     "details": [{
//       "appID": "<TEAM_ID>.com.pobo.app",
//       "paths": ["/e/*"]
//     }]
//   }
// }
//
// Also needs the matching `com.apple.developer.associated-domains`
// entitlement added to apps/mobile/app.json's ios config once we're there.
export async function GET() {
  return Response.json(
    { applinks: { details: [] } },
    { headers: { 'Content-Type': 'application/json' } },
  );
}
