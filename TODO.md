# TODO

## 1) manifest.json cleanup
- ✅ Removed unsupported `orientation` field to fix: “Manifest: unknown 'orientation' value ignored.”


## 2) auth.js syntax fix
- ⚠️ auth.js currently parses successfully in Node (`new Function(...)`). Runtime “Unexpected token '}'” likely came from a previous build artifact or minified bundle; re-test in browser after other changes.

- Fix SyntaxError near `auth.js:139` (Unexpected token '}' ).
- Re-parse/verify JS after patch.

## 3) index.html CSP update
- ✅ Updated CSP `connect-src` to allow `https://www.googleapis.com` (required by identitytoolkit calls).


## 4) Verification
- Reload site / re-check DevTools console for removed errors.

