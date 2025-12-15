# README #

This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

* Quick summary
* Version
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###

* Summary of set up
* Configuration
* Dependencies
* Database configuration
* How to run tests
* Deployment instructions

### SEO Compliance Check

The project includes an automated SEO audit system.

- Run full report: `npm run audit`
- Run verify mode (fails on Critical/High issues): `npm run audit:verify`

Reports are saved to `/doc/report/`:
- `compliance-latest.md` — human-readable
- `compliance-latest.json` — machine-readable

Configuration options:
- `GUIDELINES_PATH` — override path to `SEO_Guidelines.md` (default: `/Users/deepakkumarc/work/crecientech/repos/newweb/cricentech/SEO_Guidelines.md`)
- `REPORT_DIR` — override output directory (default: `/doc/report`)
- `TARGET_DIR` — analyze a different directory when used programmatically in tests

Dependencies:
- Node.js v14+
- Uses built-in modules and `fs-extra` (already in dependencies)

Tests:
- `npm test` runs unit tests for report generation, verification logic, and error handling.

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact