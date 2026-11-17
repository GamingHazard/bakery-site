import { parseStorefrontCatalogPayload } from './storefront-catalog-schema'

export async function fetchStorefrontCatalog() {
  const response = await fetch('/api/storefront/catalog', { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('The product catalog could not be refreshed.')
  }

  return parseStorefrontCatalogPayload(await response.json())
}
