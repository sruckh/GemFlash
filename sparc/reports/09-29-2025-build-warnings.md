# Build Warning Investigation

## Issue

The container build process is producing warnings related to deprecated packages and peer dependency conflicts.

## Findings

- **`ERESOLVE` error:** There is a peer dependency conflict between `eslint` and `eslint-plugin-react-hooks`. `eslint-plugin-react-hooks` requires a version of `eslint` that is older than the one being installed.
- **`inflight` memory leak:** The `inflight` package, which has a known memory leak, is a dependency of `glob`.
- **Deprecated packages:** `glob` and `rimraf` are deprecated.

## Attempts to Resolve

- **Updating all packages to latest:** This did not resolve the `ERESOLVE` issue.
- **Downgrading `eslint`:** This did not resolve the `ERESOLVE` issue.
- **Updating `glob` and `rimraf`:** This resolved the deprecation warnings for these packages.

## Next Steps

The remaining issue is the `ERESOLVE` conflict between `eslint` and `eslint-plugin-react-hooks`. The next step is to find a compatible version combination for these two packages.
