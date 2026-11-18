# The SourDough Bakery

A customer-facing Next.js storefront with a backend-backed published product catalogue, persistent shopping bag, and simulated checkout. Orders and form submissions are not sent to a real bakery, and no payment is taken.

## Run locally

Install dependencies with the project package manager (`pnpm install`), then start the development server with `pnpm dev`.

The storefront does not use a service worker. On first visit, it removes any existing root-scoped service worker and its Cache Storage entries so an older app cannot serve stale assets.

## Live catalogue and imagery

Set `BAKERY_API_URL` to the backend origin without an `/api` suffix (for example, `http://localhost:5000`). The server-rendered pages fetch `GET /api/storefront/catalog` for published products and `GET /api/storefront/settings` for the public company name, logo, and contact values. Email, phone, and address appear only when their publication switches are enabled in the company profile; absent values remain hidden. Initial server responses are revalidated every 60 seconds. Configure the backend URL in the website server environment, not as a `NEXT_PUBLIC_*` variable.

The shop renders every active, published product family returned by the catalog, with each sale option and price taken from its variants. Categories, flavours, publication dates, and bestseller/new badges are also sourced from the response. Products without an image use the local bakery-themed placeholder across product cards, details, collections, and the bag. Catalog-dependent storefront pages poll the same-origin catalog route every 10 seconds while the tab is visible and refresh when the user returns to it; updates do not navigate away or reset the current filters, sort, or scroll position. Search and category/flavour filters use live product data; the draggable maximum-price filter ranges from UGX 0 to UGX 500,000 in UGX 1,000 steps, and can be reset with the other filters. The homepage retains editorial imagery and copy, but its collection links and product cards are populated from the backend.

## Shopping bag and demo checkout

The bag stores backend variant IDs in browser local storage under `sourdough-bag-v2`. Previous mock-catalog bags are cleared because their product IDs cannot be mapped safely to backend variants. Checkout validates customer details, simulates order creation, and stores a demo confirmation under `sourdough-last-order`; it clears the bag and routes to `/confirmation`. No real payment processing, order persistence, or form delivery is configured.

## Website communications and newsletter

The contact and custom-order forms submit to the bakery server and are stored in the shared communications inbox. Custom orders remain enquiries: they are not confirmed sales or orders until staff review availability, pricing, and timing and use the bakery order workflow. A submitted message receives a reference and an acknowledgement email when Resend is configured.

Newsletter signup uses explicit consent and double opt-in. The address is added to the marketing audience only after the recipient verifies it. Subscribers can unsubscribe from a confirmation page, and the administration workspace can suspend, unsubscribe, or delete subscriber records. Campaigns are restricted to verified, active subscribers synchronized with the configured Resend segment.

Configure `BAKERY_API_URL` in the website server environment to the bakery server origin and configure the Resend sender, webhook, token secret, and newsletter segment values on the backend. The storefront proxies form requests through same-origin Next.js routes; no Resend API secret is exposed to the browser. Domain DNS/MX records must be configured separately by the operator before inbound email works.

Checkout remains a demonstration. It does not create an order, process payment, or send purchase/order confirmation emails.
