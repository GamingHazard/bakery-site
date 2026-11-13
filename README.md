# The SourDough Bakery

A customer-facing Next.js storefront with a local mock catalogue, persistent demo shopping bag, and simulated checkout. Orders and form submissions are not sent to a real bakery, and no payment is taken.

## Run locally

Install dependencies with the project package manager (`pnpm install`), then start the development server with `pnpm dev`.

## Catalogue and imagery

The editable mock catalogue is in `app/storefront.tsx`, in the `products` array. Update the product name, description, category, UGX price, image URL, tag, and availability there. Collection definitions live beside it. Product imagery currently uses Unsplash image URLs. The six original hero poster image files were not present in the supplied prompt attachment, so the homepage carousel currently uses relevant bakery photography; replace the `carouselImages` entries when the poster files are available.

## Shopping bag and demo checkout

The bag is stored in browser local storage under `sourdough-bag-v1`. Checkout validates customer details, simulates order creation, and stores a demo confirmation under `sourdough-last-order`; it clears the bag and routes to `/confirmation`. No real payment processing, order persistence, or form delivery is configured.

## Backend connection points

The current storefront intentionally uses local mock data and simulated form handling. A future backend can replace the inline catalogue and simulated submit handlers in `app/storefront.tsx` with service modules and real API routes for product/category retrieval, order creation, contact/custom-order messages, and newsletter subscriptions. Add authentication, server-side order validation, durable persistence, verified business contact information, and a configured payment provider before accepting real orders.
