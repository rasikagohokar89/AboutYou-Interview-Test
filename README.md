# About You Checkout — QA Automation Test Suite

> **Playwright + TypeScript** E2E test suite for the About You e-commerce platform.  
> Covers the complete user journey: browsing, search, product detail, basket, checkout, payment.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Running Tests Locally](#running-tests-locally)
- [Running Tests by Tags](#running-tests-by-tags)
- [Generating Reports](#generating-reports)
- [Configuration Reference](#configuration-reference)
- [Git Workflow and GitLab CI/CD](#git-workflow-and-gitlab-cicd)
- [Architecture and Design Decisions](#architecture-and-design-decisions)
- [Test Coverage Summary](#test-coverage-summary)

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| **Node.js** | >= 18.0.0 |
| **npm** | >= 9.0.0 |
| **OS** | Windows / macOS / Linux |

Optional:
- A registered [About You](https://en.aboutyou.de) account (for authenticated checkout tests)
- Git (for version control and CI/CD)

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/rasikagohokar89/AboutYou-Interview-Test.git

# 2. Traverse to the directory 
cd .\AboutYou-Interview-Test\

# 3. Install dependencies
npm install

# 4. Install Playwright browsers (Chromium, Firefox)
npm run setup

# 5. Configure environment (required for authenticated checkout tests)
cp .env.example .env
# Edit .env with your test account credentials

# 6. Run all tests on Chromium (with 2 workers)
npx playwright test --project=chromium --workers=2

# 7. View the HTML report
npm run report
```
### First Run Checklist

1. Ensure `.env` has valid `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`
2. The first run executes `global-setup.ts` which logs in and saves auth state to `.auth/user.json`
3. All subsequent tests reuse this stored session (no repeated logins)

---

## Project Structure

```
aboutyou-checkout-qa/
|-- playwright.config.ts            # Playwright config (browsers, retries, reporters)
|-- tsconfig.json                   # TypeScript config with path aliases
|-- package.json                    # NPM scripts and dependencies
|-- .env.example                    # Environment variables template
|-- .gitignore                      # Git ignore rules
|
|-- src/                            # Source code (framework layer)
|   |-- config/
|   |   +-- test.config.ts          # Centralized config from env vars
|   |-- types/
|   |   |-- product.types.ts        # Product/variant TypeScript interfaces
|   |   |-- cart.types.ts           # Cart item/summary interfaces
|   |   |-- checkout.types.ts       # Address/payment/order interfaces
|   |   +-- api-response.types.ts   # API response envelope types
|   |-- schemas/
|   |   |-- cart.schema.ts          # AJV JSON schemas for cart API
|   |   |-- checkout.schema.ts      # AJV JSON schemas for checkout API
|   |   +-- schema-validator.ts     # Reusable AJV validation utility
|   |-- pages/                      # Page Object Model (POM)
|   |   |-- base.page.ts            # Abstract base (cookies, popups, safe interactions)
|   |   |-- home.page.ts            # Homepage (search, nav, wishlist, language)
|   |   |-- product-listing.page.ts # PLP (product cards, filters, sort)
|   |   |-- product-detail.page.ts  # PDP (sizes, add to basket, wishlist)
|   |   |-- basket.page.ts          # Cart (items, quantities, totals, vouchers)
|   |   |-- checkout.page.ts        # Checkout (address, shipping, payment, order)
|   |   |-- wishlist.page.ts        # Wishlist (items, remove, add to bag)
|   |   +-- login.page.ts           # Authentication (email/password login)
|   |-- fixtures/
|   |   +-- test.fixtures.ts        # Custom Playwright fixtures (POM + cart setup)
|   |-- helpers/
|   |   |-- api-interceptor.ts      # Payment/API mocking (success, decline, timeout)
|   |   |-- test-data.ts            # Test data generators (addresses, queries, vouchers)
|   |   +-- network-helper.ts       # Request/response capture utilities
|   |-- global-setup.ts             # Auth state persistence (login then save cookies)
|   +-- global-teardown.ts          # Cleanup after all tests
|
|-- tests/                          # Test specs (organized by domain)
|   |-- pre-checkout/               # Discovery journey (no auth required)
|   |   |-- navigation.spec.ts      # Header, nav links, basket/wishlist icons
|   |   |-- search-and-browse.spec.ts  # Search, PDP, security (XSS/SQLi)
|   |   |-- search-filters.spec.ts  # 10+ filter categories, sort, clear
|   |   |-- element-verification.spec.ts  # UI element checks across pages
|   |   +-- wishlist.spec.ts        # Add/remove wishlist, badge, page elements
|   |-- basket/                     # Cart management
|   |   +-- cart-management.spec.ts # Add/remove, quantity, persistence, edge cases
|   |-- checkout/                   # Checkout flow (requires auth)
|   |   |-- checkout-flow.spec.ts   # E2E checkout with mocked payment
|   |   |-- address-validation.spec.ts  # Valid/invalid addresses, collection points
|   |   |-- order-summary.spec.ts   # Order summary details verification
|   |   |-- voucher-promo.spec.ts   # Valid/invalid voucher codes
|   |   |-- payment-handling.spec.ts    # Payment success, timeout, network error
|   |   |-- checkout-edge-cases.spec.ts # Back button, refresh, navigate away
|   |   +-- guest-vs-auth.spec.ts   # Login redirect, cart preservation
|   +-- api/                        # API-level validation
|       +-- checkout-api-validation.spec.ts  # API capture, schemas
|
|-- docs/
|   |-- WRITEUP.md                  # QA strategy write-up
|   +-- BUG_REPORT.md              # Bug documentation
|
+-- test-coverage-matrix.csv        # Full test coverage spreadsheet (Excel)
```

---

## Running Tests Locally

### NPM Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests (all configured browsers) |
| `npm run test:checkout` | Run only checkout tests |
| `npm run test:basket` | Run only basket/cart tests |
| `npm run test:api` | Run only API validation tests |
| `npm run test:chromium` | Run on Chromium only |
| `npm run test:firefox` | Run on Firefox only |
| `npm run test:headed` | Run with visible browser window |
| `npm run test:debug` | Run with Playwright step-through debugger |
| `npm run test:ui` | Open Playwright UI mode (interactive) |
| `npm run report` | Open the last HTML report in browser |
| `npm run setup` | Install Playwright browsers + system deps |

### Direct Playwright Commands

```bash
# Run a single spec file
npx playwright test tests/checkout/checkout-flow.spec.ts --project=chromium

# Run a specific test by name
npx playwright test -g "Verify complete checkout process" --project=chromium

# Run with visible browser
npx playwright test --project=chromium --headed

# Run with 4 parallel workers
npx playwright test --project=chromium --workers=4

# Run with retries
npx playwright test --project=chromium --retries=2

# Run tests from a specific folder
npx playwright test tests/pre-checkout/ --project=chromium
```

---

## Running Tests by Tags

Tests use inline tags in their names (e.g. `@smoke`, `@regression`) for selective execution via `--grep`.

### Tag Reference

| Tag | Purpose | Count | When to Run |
|-----|---------|-------|-------------|
| `@smoke` | Critical paths that must always pass | 14 | Every commit, every PR |
| `@regression` | Full regression coverage | 52 | Before releases, nightly |
| `@negative` | Invalid input / error handling | 9 | Regression cycles |
| `@edge-case` | Boundary conditions, unusual flows | 12 | Regression cycles |
| `@positive` | Happy-path validation | 1 | Regression cycles |
| `@api` | API-level response validation | 3 | API changes |

### Domain Tags

| Tag | Purpose |
|-----|---------|
| `@checkout` | Checkout domain tests |
| `@navigation` | Navigation/header tests |
| `@wishlist` | Wishlist functionality |
| `@search` | Search and filter tests |
| `@filters` | Filter-specific tests |
| `@order-summary` | Order summary tests |
| `@ui-verification` | Element presence checks |

### Tag Execution Examples

```bash
# Smoke tests only (fast, critical paths)
npm run test:smoke
# or: npx playwright test --grep @smoke --project=chromium

# Full regression suite
npm run test:regression
# or: npx playwright test --grep @regression --project=chromium

# Negative tests only
npm run test:negative
# or: npx playwright test --grep @negative --project=chromium

# Edge case scenarios
npm run test:edge
# or: npx playwright test --grep @edge-case --project=chromium

# Combine tags (AND logic, both must match)
npx playwright test --grep "(?=.*@smoke)(?=.*@regression)" --project=chromium

# Combine tags (OR logic, either matches)
npx playwright test --grep "@smoke|@negative" --project=chromium

# Exclude a tag (run everything EXCEPT edge cases)
npx playwright test --grep-invert @edge-case --project=chromium

# Domain-specific
npx playwright test --grep @checkout --project=chromium
npx playwright test --grep @wishlist --project=chromium
npx playwright test --grep @filters --project=chromium
```

### Suggested CI Tag Groups

| Pipeline Stage | Tags | Purpose |
|----------------|------|---------|
| **PR Check** | `@smoke` | Fast gate (approx 5 min) |
| **Merge to Main** | `@smoke @regression` | Comprehensive (approx 30 min) |
| **Nightly** | All (no grep filter) | Full suite including edge cases |
| **Pre-Release** | `@regression @negative @edge-case` | Maximum coverage |

---

## Generating Reports

### HTML Report (Default)

```bash
# Run tests (report is auto-generated)
npx playwright test --project=chromium

# Open the HTML report
npm run report
# or: npx playwright show-report
```

The HTML report is saved to `playwright-report/` and includes:
- Pass/fail status per test
- Screenshots on failure
- Video recordings on failure (retained only)
- Trace files for debugging (retained on failure)

### JUnit XML Report (CI)

Automatically generated in CI (when `CI=true`):

```bash
# Output: test-results/junit-report.xml
CI=true npx playwright test --project=chromium
```

### List Reporter (Console)

Always enabled. Prints results to the terminal during execution.

### Trace Viewer

For failed tests, open the trace to see a step-by-step timeline:

```bash
# Open a specific trace file
npx playwright show-trace test-results/<test-folder>/trace.zip
```

### Report Artifacts in CI

In GitLab CI, reports are automatically saved as artifacts:
- `playwright-report/` — HTML report (browseable)
- `test-results/` — Screenshots, videos, traces
- `test-results/junit-report.xml` — JUnit XML for GitLab test tab

---

## Configuration Reference

### Environment Variables (.env)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `BASE_URL` | Storefront URL under test | `https://en.aboutyou.de` | No |
| `TEST_USER_EMAIL` | Test account email | (none) | Yes (for checkout) |
| `TEST_USER_PASSWORD` | Test account password | (none) | Yes (for checkout) |
| `DEFAULT_TIMEOUT` | Global test timeout (ms) | `60000` | No |
| `NAVIGATION_TIMEOUT` | Page navigation timeout (ms) | `60000` | No |
| `ACTION_TIMEOUT` | Click/fill action timeout (ms) | `30000` | No |
| `HEADLESS` | Run browsers in headless mode | `true` | No |
| `SLOW_MO` | Slow down actions by N ms | `0` | No |
| `RETRIES` | Number of retries on failure | `1` | No |
| `WORKERS` | Parallel worker count | `2` | No |
| `ENV` | Environment tag (staging/prod) | `staging` | No |

### Playwright Config (playwright.config.ts)

| Setting | Local | CI |
|---------|-------|-----|
| `retries` | From `RETRIES` env (default: 1) | 2 |
| `workers` | From `WORKERS` env (default: 2) | 1 (sequential for stability) |
| `fullyParallel` | `false` | `false` |
| `reporter` | `html` + `list` | `html` + `list` + `junit` |
| `screenshot` | `only-on-failure` | `only-on-failure` |
| `video` | `retain-on-failure` | `retain-on-failure` |
| `trace` | `retain-on-failure` | `retain-on-failure` |
| `forbidOnly` | `false` | `true` (fails on `test.only`) |

### TypeScript Config (tsconfig.json)

| Feature | Value |
|---------|-------|
| Target | `ES2022` |
| Module | `commonjs` |
| Strict | `true` |
| Path Aliases | `@pages/*`, `@fixtures/*`, `@helpers/*`, `@types/*`, `@schemas/*`, `@config/*` |

### Browser Projects

| Project | Browser | Auth State | Dependencies |
|---------|---------|------------|--------------|
| `setup` | (none) | Creates `.auth/user.json` | None |
| `chromium` | Desktop Chrome | Uses stored state | `setup` |
| `firefox` | Desktop Firefox | Uses stored state | `setup` |
| `cleanup` | (none) | (none) | Runs after all |

---

## Git Workflow and GitLab CI/CD

### Pushing to Git

```bash
# Initialize git (if not already)
git init

# Add all files (respects .gitignore)
git add .

# Commit
git commit -m "feat: initial test suite with 75 test cases"

# Add remote
git remote add origin <your-gitlab-repo-url>

# Push to main
git push -u origin main
```

### What is Excluded from Git (.gitignore)

- `node_modules/` — dependencies (installed via `npm ci`)
- `.auth/` — stored auth cookies (contains session data)
- `.env` — secrets (credentials)
- `test-results/` — test artifacts (generated on each run)
- `playwright-report/` — HTML reports (generated on each run)

### GitLab CI Configuration

Create `.gitlab-ci.yml` in the project root:

```yaml
stages:
  - test

variables:
  CI: "true"
  BASE_URL: $STAGING_URL
  TEST_USER_EMAIL: $QA_TEST_EMAIL
  TEST_USER_PASSWORD: $QA_TEST_PASSWORD

# Smoke Tests (on every MR/push)
test:smoke:
  image: mcr.microsoft.com/playwright:v1.52.0-noble
  stage: test
  script:
    - npm ci
    - npx playwright install --with-deps
    - npx playwright test --grep @smoke --project=chromium
  artifacts:
    when: always
    paths:
      - playwright-report/
      - test-results/
    reports:
      junit: test-results/junit-report.xml
    expire_in: 3 days
  rules:
    - if: $CI_MERGE_REQUEST_ID
    - if: $CI_COMMIT_BRANCH

# Full Regression (on merge to main)
test:regression:
  image: mcr.microsoft.com/playwright:v1.52.0-noble
  stage: test
  script:
    - npm ci
    - npx playwright install --with-deps
    - npx playwright test --grep @regression --project=chromium
  artifacts:
    when: always
    paths:
      - playwright-report/
      - test-results/
    reports:
      junit: test-results/junit-report.xml
    expire_in: 7 days
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

# Nightly Full Suite
test:nightly:
  image: mcr.microsoft.com/playwright:v1.52.0-noble
  stage: test
  script:
    - npm ci
    - npx playwright install --with-deps
    - npx playwright test --project=chromium
  artifacts:
    when: always
    paths:
      - playwright-report/
      - test-results/
    reports:
      junit: test-results/junit-report.xml
    expire_in: 14 days
  rules:
    - if: $CI_PIPELINE_SOURCE == "schedule"
```

### GitLab CI Variables (Required)

Set these in **GitLab > Settings > CI/CD > Variables**:

| Variable | Type | Masked | Description |
|----------|------|--------|-------------|
| `STAGING_URL` | Variable | No | `https://en.aboutyou.de` |
| `QA_TEST_EMAIL` | Variable | Yes | Test account email |
| `QA_TEST_PASSWORD` | Variable | Yes | Test account password |

### Viewing Results in GitLab

1. **Pipeline Page** — Click the job to see console output
2. **Tests Tab** — JUnit report shows pass/fail with error details
3. **Artifacts** — Download `playwright-report/` and open `index.html` locally
4. **Browse Artifacts** — View screenshots and traces in `test-results/`

---

## Architecture and Design Decisions

### 1. Page Object Model (POM) with Abstract Base Class

All pages extend `BasePage` which handles common challenges (cookie banners, Cloudflare Turnstile, popups). Individual page objects focus purely on domain logic. `safeClick()` wraps Playwright's click with automatic popup dismissal and retry, making tests resilient to overlay interruptions.

```
BasePage (abstract)
  |-- dismissCookieConsent()
  |-- solveTurnstile()
  |-- safeClick() / safeFill()
  |-- waitForNetworkIdle()
  |-- isElementVisible()
  +-- dismissPopups()
      |-- HomePage
      |-- ProductListingPage
      |-- ProductDetailPage
      |-- BasketPage
      |-- CheckoutPage
      |-- WishlistPage
      +-- LoginPage
```

### 2. Custom Playwright Fixtures

Fixtures provide dependency injection. Test files declare what they need (`basketPage`, `checkoutPage`) and the framework supplies pre-configured instances. The `pageWithProductsInCart` fixture handles the entire search-select-size-add flow, so checkout tests start with a ready cart without duplicating setup code.

The `productsToAdd` option is configurable per-test via `test.use({ productsToAdd: ['pant'] })`, allowing different tests to set up different cart states without fixture changes.

### 3. Randomized Product Selection

`clickRandomProduct()` picks a random product from the top 10 visible items. This prevents parallel workers from competing over the same item, reducing flakiness caused by stock limits or cart conflicts.

### 4. Randomized Search Queries

The `GENERAL_SEARCH_QUERIES` array (`dress`, `t-shirt`, `jeans`, `hoodie`, `jacket`, `sneakers`, `shirt`) is randomly sampled for each test run. Parallel workers search for different terms, reducing the chance of hitting the same product pages.

### 5. API Mocking for Payment Flows

The `ApiInterceptor` uses Playwright's `page.route()` to intercept payment API calls and return controlled responses. This enables testing success, decline, timeout, and 3D Secure flows without touching real payment infrastructure or incurring real charges.

### 6. Storage State for Auth Persistence

`global-setup.ts` logs in once and saves session cookies to `.auth/user.json`. All browser projects reuse this stored session. This saves approximately 10 seconds per test and eliminates login flakiness.

### 7. AJV Schema Validation

API responses are validated against JSON schemas (via AJV) to catch structural regressions: missing fields, wrong types, unexpected formats. This catches issues at the API level before they surface as UI failures.

### 8. TypeScript Path Aliases

Clean imports (`import { TestData } from '@helpers/test-data'`) instead of fragile relative paths. Makes refactoring and moving files safe.

### 9. Centralized Test Data

All test data (addresses, search queries, voucher codes) lives in `src/helpers/test-data.ts`. When the site changes validation rules, updates happen in a single file instead of across 75 tests.

### 10. Tag-Based Test Organization

Tests use inline tags (`@smoke`, `@regression`, `@negative`, `@edge-case`) in their names, enabling CI pipeline stages (smoke on PR, regression on merge, full suite nightly) and developer workflows (`--grep @smoke` for a quick sanity check).

### 11. Parallel-Safe Test Design

- `test.describe.configure({ mode: "parallel" })` on independent test suites
- Random product/search selection prevents worker collisions
- `afterEach` hooks clean up state (clear cart, remove wishlist items)
- No shared mutable state between tests

### 12. Resilient Locator Strategy

Locator priority order used throughout the POM:
1. `data-test-id` / `data-testid` attributes (most stable)
2. `getByRole()` with accessible names (semantic, resilient to CSS changes)
3. `getByText()` with regex (handles i18n with English/German patterns)
4. CSS selectors as last resort (for dynamic class names)

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@playwright/test` | ^1.52.0 | Test framework and browser automation |
| `typescript` | ^5.8.0 | Type safety and developer experience |
| `ajv` | ^8.17.0 | JSON Schema validation for API responses |
| `ajv-formats` | ^3.0.1 | Format validation (email, date, URI) |
| `dotenv` | ^16.5.0 | Environment variable loading from .env |
| `@types/node` | ^22.15.0 | Node.js type definitions |
