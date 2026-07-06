# Write-Up: Test Strategy & Decisions

## What I Chose to Test — and Why
### Basic Functional Tests (User-Critical)
These are the tests that, if broken, would directly prevent a user from completing their shopping journey.
- **Login / Logout** — Without login, the user cannot reach checkout. Entry gate to the authenticated experience.
- **Page Navigation** — Users need to move between pages. Verified header links, category links, basket icon, and wishlist icon.
- **UI Element Verification** — Product name, price, images, sizes, and brand must be visible. Verified key elements across homepage, PDP, basket, and checkout.
- **Interactive Elements** — Buttons, dropdowns, and links must be clickable. Verified across basket, PLP, PDP, and checkout pages.
- **Filters** — Thousands of products need filtering. Tested 10+ filter categories (Brand, Color, Size, Price, etc.), applied filters, and verified clear-all works.
- **Search** — Fastest way to find a product. Tested valid queries, no-result handling, and security inputs (XSS, SQL injection).

### Basic Flows
**Cart/Basket Management** — People add things to their cart well before they decide to buy. The cart is where users make quantity decisions, compare prices, and decide whether to proceed. If the cart is unreliable, users lose confidence.
- **Positive**: Add/remove items, verify details, proceed to checkout, quantity changes with price verification.
- **Negative**: Exceed max stock, empty cart message, add without selecting size.

**Wishlist** — Users save products for later. Tested add from PDP, badge count, page elements, and removal.

### Checkout (Main Focus)
My main focus was checkout because the user should be able to buy the product. If any step breaks, the business loses revenue directly.
- **Login** — Verified redirect for unauthenticated users. Session persisted via stored auth state.
- **Shipping Details** — Tested valid DE/AT addresses, empty field errors, and collection point selection.
- **Payment Details** — Used API mocking to avoid real charges. Tested payment selection, consent, and place order. Mocked success (201) and decline (402) scenarios.
- **Order Summary** — Verified product name, subtotal, shipping, and total. Confirmed checkout total matches basket total.

### API Testing
API testing catches issues at the data layer before they surface in the UI.
- **Verifying Expected APIs Are Called** — Confirmed correct endpoints are called with right HTTP methods and status codes during checkout actions.
- **Mocking for Third-Party Dependencies** — Payment gateways are external systems we don't control. Used `page.route()` to intercept and return controlled responses (success/decline) without real transactions.

### Negative and Edge Cases
Included scenarios real users encounter daily: browser back button, page refresh mid-checkout, navigate away and return, invalid voucher codes, and submitting without selecting a collection point.

## What I Deliberately Left Out

| Area | Why |
|------|-----|
| **Full real payment execution** | Production site with real money — would generate actual charges |
| **Mobile responsive testing** | Would expand surface significantly; would add Playwright mobile viewports with more time |
| **Performance/load testing** | Requires different tooling (JMeter, k6); documented in "with more time" below |
| **Email verification flows** | Would need an email inbox API (Mailinator, etc.) |
| **Social login E2E** | Requires real OAuth credentials for Google/Facebook/Apple |

## What I Would Test With More Time and Resources
- **Performance Testing** — Site must handle high traffic. Test flash sale behaviour, page load times under load, concurrent checkouts. Use JMeter or k6.
- **Load Testing** — Find the breaking point. Identify bottlenecks (DB, payment gateway, CDN), plan capacity for campaigns like Black Friday, verify graceful degradation.
- **Security Testing** — Data privacy is critical. Test user data isolation, concurrent last-item purchases, OWASP ZAP scanning, session expiry and invalidation.
- **Database Validation** — Verify orders are actually persisted after checkout, not just that the API responded.
- **Mobile Testing** — Add Playwright mobile viewports since About You is heavily used on mobile.
- **API-centric Tests** — With Swagger/OpenAPI docs, add dedicated endpoint tests with schema validation.

## Assumptions
1. The storefront is stable
2. No test data API exists
3. Payment APIs follow standard patterns
4. Cookie consent is a gate
5. Expected things are happening in backend

## Architecture Decisions
- Page Object Model
- Abstract Base Class
- Custom Playwright Fixtures
- API Mocking over Real Payments
- Randomised Product and Search Selection
- AJV Schema Validation
- TypeScript with Strict Mode
- Tag-based Execution
- Storage State for Auth
- Resilient Locator Strategy
- Centralised Test Data
- afterEach Cleanup Hooks
