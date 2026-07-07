# Bug Report: Intermittent Missing Collection Point Radio Button during Checkout

## Summary
During the checkout delivery step, the radio button to select a collection point is intermittently not rendered on the UI, preventing the user from completing the selection. This causes the edge-case test `Verify that continue button is disabled when no collection points are selected @edge-case` to fail intermittently.

---

## Bug Details

- **Bug ID**: BUG-001
- **Severity**: High (Blocks checkout completion for users who select pickup/collection point delivery)
- **Frequency**: Intermittent
- **Area**: Checkout > Shipping Address / Collection Points
- **Environment**: Storefront Production/Staging (observed on Chromium)

---

## Steps to Reproduce

1. Add any product to the basket and proceed to the basket page.
2. Click **Proceed to checkout**.
3. Fill in the shipping address details and proceed to checkout 
4. Do the above 3 steps 4-5 times or sometime might need to do more 
5. Toggle or select the option to deliver to a **Collection Point** (Paketshop / Pick up).
6. Intermittently, noticed that the **Collection Point** section or radio button is not visible

### Expected Behavior
The **Collection Point** section or radio button is always visible and user should be able to select a collection point and continue to the next step.

### Actual Behavior
The collection point options or radio button is missing entirely from the layout.

### Attachment
Refer screenshot BugBug001.png

## Technical Observations & Potential Root Causes

1. **API Latency / Timeout**: The backend API responsible for suggesting or listing nearby collection points based on the postal code (`/api/co/v3/...`) may be failing, returning an empty list, or timing out under load.
2. **Dynamic UI Rendering Race Condition**: The storefront UI may suffer from a race condition where the step transition to the collection point view completes before the API response is fully loaded or bound to the DOM, resulting in a blank or incomplete list state.

