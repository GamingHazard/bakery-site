import Storefront from './storefront'
import { getStorefrontCatalog, getStorefrontSettings } from '../lib/storefront-catalog'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const [catalog, settings] = await Promise.all([
    getStorefrontCatalog(),
    getStorefrontSettings(),
  ])
  return (
    <Storefront
      products={catalog.products}
      catalogError={catalog.error}
      settings={settings.settings}
      settingsError={settings.error}
    />
  )
}
