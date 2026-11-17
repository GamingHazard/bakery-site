export type StorefrontBadge = 'bestseller' | 'new'

export type StorefrontVariant = {
  id: string
  sku: string
  name: string
  saleUnit: string
  unitsPerSaleUnit: number
  price: number
}

export type StorefrontProduct = {
  id: string
  name: string
  category: string
  flavour: string
  slug: string
  description: string
  ingredientsStatement: string
  allergens: string[]
  images: Array<{ url: string; altText: string }>
  firstPublishedAt: string | null
  badges: StorefrontBadge[]
  variants: StorefrontVariant[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function parseProduct(value: unknown): StorefrontProduct {
  if (!isRecord(value)
    || typeof value.id !== 'string'
    || typeof value.name !== 'string'
    || typeof value.category !== 'string'
    || typeof value.flavour !== 'string'
    || typeof value.slug !== 'string'
    || typeof value.description !== 'string'
    || typeof value.ingredientsStatement !== 'string'
    || !isStringArray(value.allergens)
    || !Array.isArray(value.images)
    || !Array.isArray(value.variants)
    || !Array.isArray(value.badges)
    || (value.firstPublishedAt !== null && typeof value.firstPublishedAt !== 'string')) {
    throw new Error('The catalog contains a product with an unsupported shape.')
  }

  const images = value.images.map((image) => {
    if (!isRecord(image) || typeof image.url !== 'string' || typeof image.altText !== 'string') {
      throw new Error(`The catalog image for ${value.name} is invalid.`)
    }
    return { url: image.url, altText: image.altText }
  })
  const variants = value.variants.map((variant) => {
    if (!isRecord(variant)
      || typeof variant.id !== 'string'
      || typeof variant.sku !== 'string'
      || typeof variant.name !== 'string'
      || typeof variant.saleUnit !== 'string'
      || !Number.isSafeInteger(variant.unitsPerSaleUnit)
      || !Number.isSafeInteger(variant.price)
      || Number(variant.unitsPerSaleUnit) < 1
      || Number(variant.price) < 1) {
      throw new Error(`The catalog variant for ${value.name} is invalid.`)
    }
    return {
      id: variant.id,
      sku: variant.sku,
      name: variant.name,
      saleUnit: variant.saleUnit,
      unitsPerSaleUnit: Number(variant.unitsPerSaleUnit),
      price: Number(variant.price),
    }
  })
  if (variants.length === 0) {
    throw new Error(`The catalog product ${value.name} has no active variants.`)
  }
  const badges = value.badges.map((badge) => {
    if (badge !== 'bestseller' && badge !== 'new') {
      throw new Error(`The catalog badge for ${value.name} is invalid.`)
    }
    return badge
  })

  return {
    id: value.id,
    name: value.name,
    category: value.category,
    flavour: value.flavour,
    slug: value.slug,
    description: value.description,
    ingredientsStatement: value.ingredientsStatement,
    allergens: value.allergens,
    images,
    firstPublishedAt: value.firstPublishedAt,
    badges,
    variants,
  }
}

export function parseStorefrontCatalogPayload(value: unknown): StorefrontProduct[] {
  if (!isRecord(value) || !Array.isArray(value.products)) {
    throw new Error('The product catalog response is invalid.')
  }
  return value.products.map(parseProduct)
}
