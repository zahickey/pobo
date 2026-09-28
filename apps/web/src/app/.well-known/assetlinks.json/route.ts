// Android App Links association file — required at exactly this path for
// https://<domain>/e/<id> to open the app directly. Currently empty: needs
// the real Android package name and the SHA-256 fingerprint of the release
// signing certificate (from `eas credentials` once we set up an EAS/Play
// Console project), neither of which exist yet. Fill in once they do:
//
// [{
//   "relation": ["delegate_permission/common.handle_all_urls"],
//   "target": {
//     "namespace": "android_app",
//     "package_name": "com.pobo.app",
//     "sha256_cert_fingerprints": ["AA:BB:...:FF"]
//   }
// }]
export async function GET() {
  return Response.json([], { headers: { 'Content-Type': 'application/json' } });
}
