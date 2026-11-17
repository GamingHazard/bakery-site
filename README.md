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

## Demo-only forms

The checkout, contact/custom-order forms, and newsletter signup remain demonstrations and do not send or persist requests. Do not treat the website as an order channel until guest/customer identity, server-side order validation, durable order persistence, verified business contact information, and payment/fulfilment workflows have been implemented.
