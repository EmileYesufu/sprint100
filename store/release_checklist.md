# Release Checklist

## Build Preparation
- [ ] Bump build numbers (`npm version patch` or Xcode/Gradle increment)
- [ ] Regenerate signing assets / verify provisioning profiles
- [ ] Validate release notes formatting (two sentences; include bullet list for highlight)

## Verification Steps
- [ ] `npm run test:integration`
- [ ] `npm run test:unit`
- [ ] `npm run lint`
- [ ] Confirm `/health/live` and `/health/ready` endpoints report ready

## App Store Collateral
- [ ] Confirm `store/description.txt` content matches latest marketing copy
- [ ] Verify screenshots folder contains latest media
- [ ] Privacy policy link in `privacy_policy_url.txt` is accessible
