'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, Heart, Menu, Minus, Plus, Search, ShoppingBag, X } from 'lucide-react'

import type { StorefrontProduct, StorefrontSettings, StorefrontVariant } from '../lib/storefront-catalog'
import { fetchStorefrontCatalog } from '../lib/storefront-catalog-client'

type Product = StorefrontProduct & { image: string; price: number; tag?: string }
const photo = (id: string, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=82`
type BagLine = { id: string; quantity: number }
const isBagLine = (line: unknown): line is BagLine => line !== null && typeof line === 'object'
  && 'id' in line && typeof line.id === 'string'
  && 'quantity' in line && typeof line.quantity === 'number'
  && Number.isSafeInteger(line.quantity) && line.quantity > 0
const money = (n: number) => `UGX ${n.toLocaleString('en-UG')}`
const PRODUCT_IMAGE_PLACEHOLDER = '/product-image-placeholder.svg'
const productImageRecord = (product: StorefrontProduct) => product.images.find(image => image.url.trim())
const productImage = (product: StorefrontProduct) => productImageRecord(product)?.url.trim() || PRODUCT_IMAGE_PLACEHOLDER
const productImageAlt = (product: StorefrontProduct) => productImageRecord(product)?.altText || (productImageRecord(product) ? product.name : `No image available for ${product.name}`)
const productPrice = (product: StorefrontProduct) => Math.min(...product.variants.map((variant) => variant.price))
const categorySlug = (category: string) => category.toLowerCase().replaceAll(' ', '-').replaceAll('&', 'and')
const categoriesFor = (products: Product[]) => Array.from(new Set(products.map((product) => product.category))).map((name) => {
  const firstProduct = products.find((product) => product.category === name)!
  return { name, label: name, blurb: firstProduct.description, image: productImage(firstProduct) }
})
const cartItemFor = (products: Product[], variantId: string) => {
  for (const product of products) {
    const variant = product.variants.find((item) => item.id === variantId)
    if (variant) return { product, variant }
  }
  return undefined
}

function Header({ count, companyName, logoUrl }: { count: number; companyName: string; logoUrl: string }) {
  const [open, setOpen] = useState(false)
  return <><div className="announcement">Freshly baked artisan goodness, made with care <span>·</span> Kampala, Uganda</div><header className="site-header"><Link href="/" className="wordmark brand-lockup" aria-label={`${companyName} home`}><img className="brand-logo" src={logoUrl || '/sourdough-baker-logo.png'} alt={`${companyName} logo`}/><strong>{companyName}</strong></Link><nav className="desktop-nav"><Link href="/">Home</Link><Link href="/shop">Shop</Link><Link href="/story">Our Story</Link><Link href="/custom-orders">Custom Orders</Link><Link href="/contact">Contact</Link></nav><div className="header-actions"><Link aria-label="Search products" href="/shop?search=" className="icon-button"><Search size={19}/></Link><Link aria-label={`Shopping bag, ${count} items`} href="/bag" className="bag-link"><ShoppingBag size={19}/><span>Bag <b>{count}</b></span></Link><button className="icon-button mobile-menu-trigger" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X/> : <Menu/>}</button></div>{open && <nav className="mobile-nav"><Link onClick={()=>setOpen(false)} href="/">Home</Link><Link onClick={()=>setOpen(false)} href="/shop">Shop</Link><Link onClick={()=>setOpen(false)} href="/story">Our Story</Link><Link onClick={()=>setOpen(false)} href="/custom-orders">Custom Orders</Link><Link onClick={()=>setOpen(false)} href="/contact">Contact</Link></nav>}</header></>
}
function Footer({ companyName, logoUrl, contacts }: { companyName: string; logoUrl: string; contacts: StorefrontSettings['contacts'] }) {
 return <footer className="footer"><div className="footer-top"><div><Link href="/" className="wordmark footer-mark brand-lockup" aria-label={`${companyName} home`}><img className="brand-logo" src={logoUrl || '/sourdough-baker-logo.png'} alt={`${companyName} logo`}/><strong>{companyName}</strong></Link><p>Good bread takes time.<br/>Good moments deserve it.</p></div><div><h4>Explore</h4><Link href="/shop">Shop all</Link><Link href="/story">Our story</Link><Link href="/custom-orders">Custom orders</Link></div><div><h4>Find us</h4>{contacts.address && <span>{contacts.address}</span>}{contacts.phone && <a href={`tel:${encodeURIComponent(contacts.phone)}`}>{contacts.phone}</a>}{contacts.email && <a href={`mailto:${encodeURIComponent(contacts.email)}`}>{contacts.email}</a>}</div><div><h4>Hours</h4><span>Opening hours to be confirmed</span><span>Social links to be added</span></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {companyName}</span><div><a href="#privacy">Privacy</a><a href="#terms">Terms</a><a href="#delivery">Delivery</a></div><span>Made with patience in Kampala</span></div></footer>
}
function ProductCard({ item, onAdd }: { item: Product; onAdd: (p: Product, variant?: StorefrontVariant) => void }) { return <article className="product-card"><Link href={`/product/${item.slug}`} className="product-image-wrap"><img src={productImage(item)} alt={productImageAlt(item)} className="product-image"/>{item.badges.map((badge) => <span className="product-tag" key={badge}>{badge === 'bestseller' ? 'Bestseller' : 'New'}</span>)}<button className="quick-add" aria-label={`Add ${item.name} to bag`} onClick={e=>{e.preventDefault(); onAdd(item)}}><Plus size={19}/></button></Link><div className="product-card-copy"><div><Link href={`/product/${item.slug}`} className="product-name">{item.name}</Link><p>{item.category}</p></div><span className="product-price">{item.variants.length>1?'From ':''}{money(productPrice(item))}</span></div></article> }
function ProductGrid({ items, onAdd }: { items: Product[]; onAdd: (p: Product, variant?: StorefrontVariant) => void }) { return <div className="product-grid">{items.map(item=><ProductCard key={item.id} item={item} onAdd={onAdd}/>)}</div> }
function ButtonLink({ href, children, variant = 'dark' }: { href: string; children: React.ReactNode; variant?: 'dark'|'light'|'line' }) { return <Link href={href} className={`button button-${variant}`}>{children}<ArrowUpRight size={16}/></Link> }

export default function Storefront({ products: catalogProducts, catalogError, settings, settingsError }: { products: StorefrontProduct[]; catalogError: string | null; settings: StorefrontSettings; settingsError: string | null }) {
 const pathname = usePathname(); const router = useRouter()
 const path=pathname.split('/').filter(Boolean); const segment=path[0]||'home'
 const catalogNeeded=['home','shop','collection','product','bag','checkout'].includes(segment)
 const [bag, setBag] = useState<BagLine[]>([]); const [ready, setReady] = useState(false); const [slide, setSlide] = useState(0); const [toast, setToast] = useState('')
 const catalogQuery = useQuery({
  queryKey: ['storefront-catalog'],
  queryFn: fetchStorefrontCatalog,
  initialData: catalogError ? undefined : catalogProducts,
  enabled: catalogNeeded,
  refetchInterval: 10_000,
  refetchIntervalInBackground: false,
  refetchOnWindowFocus: true,
  retry: 1,
 })
 const catalogData = catalogQuery.data ?? catalogProducts
 const hasCatalogData = catalogQuery.data !== undefined || catalogError === null
 const catalogUnavailable = !hasCatalogData
 const catalogRefreshError = catalogQuery.isError && hasCatalogData
 const products = useMemo(() => catalogData.map(product => ({
  ...product,
  image: productImage(product),
  price: productPrice(product),
  tag: product.badges.includes('bestseller') ? 'Bestseller' : product.badges.includes('new') ? 'New' : undefined,
 })), [catalogData])
 const companyName = settings.companyName.trim() || 'The SourDough Bakery'
 const cartProducts = useMemo(() => products.flatMap(product => product.variants.map(variant => ({
  ...product,
  id: variant.id,
  price: variant.price,
 }))), [products])
 const categories = useMemo(() => categoriesFor(products), [products])
 const variants = useMemo(() => new Map(products.flatMap(product => product.variants.map(variant => [variant.id, { product, variant }] as const))), [products])
 useEffect(() => {
  try {
   const saved = localStorage.getItem('sourdough-bag-v2')
   const legacy = localStorage.getItem('sourdough-bag-v1')
   if (legacy) {
    localStorage.removeItem('sourdough-bag-v1')
    if (!saved) setToast('Your saved demo bag was cleared because it used the old product catalog.')
   }
   if (saved) {
    const parsed: unknown = JSON.parse(saved)
    if (Array.isArray(parsed)) setBag(parsed.filter(isBagLine))
   }
  } catch (error) {
   console.error('Unable to restore the saved shopping bag.', error)
   setToast('Your saved bag could not be restored.')
  }
  setReady(true)
 }, [])
 useEffect(() => {
  if (!ready || !hasCatalogData || !bag.some(line => !variants.has(line.id))) return
  setBag(current => current.filter(line => variants.has(line.id)))
  setToast('Unavailable products were removed from your saved bag.')
 }, [bag, hasCatalogData, ready, variants])
 useEffect(()=>{ if(ready) localStorage.setItem('sourdough-bag-v2',JSON.stringify(bag)) },[bag,ready])
 useEffect(()=>{ if(pathname==='/') { const t=setInterval(()=>setSlide(n=>(n+1)%6),5000); return ()=>clearInterval(t) } },[pathname])
 const count=bag.reduce((s,line)=>s+line.quantity,0)
 const subtotal=bag.reduce((sum,line)=>sum+(variants.get(line.id)?.variant.price ?? 0)*line.quantity,0)
 const notice=(message:string)=>{setToast(message);setTimeout(()=>setToast(''),2600)}
 const add=(item:Product, selectedVariant?:StorefrontVariant)=>{
  const variant = selectedVariant ?? item.variants.reduce<StorefrontVariant | undefined>(
   (cheapest, current) => !cheapest || current.price < cheapest.price ? current : cheapest,
   undefined,
  )
  if (!variant) return
  setBag(current=>{const found=current.find(x=>x.id===variant.id);return found?current.map(x=>x.id===variant.id?{...x,quantity:x.quantity+1}:x):[...current,{id:variant.id,quantity:1}]})
  notice(`${item.name} added to your bag`)
 }
 const qty=(id:string,by:number)=>setBag(current=>current.map(line=>line.id===id?{...line,quantity:line.quantity+by}:line).filter(x=>x.quantity>0))
 const product=segment==='product'?products.find(p=>p.slug===path[1]):undefined
 const category=segment==='collection'?categories.find(c=>categorySlug(c.name)===path[1]):undefined
 const collectionItems=useMemo(()=>category?products.filter(p=>p.category===category.name):products,[category,products])
 const slides=[
  {src:'/posters/01-sourdough-breads.png',alt:'The Sourdough Bakery poster for artisan sourdough breads, featuring fresh loaves and the headline “Our Sourdough Breads”.'},
  {src:'/posters/02-cookies.png',alt:'The Sourdough Bakery poster for handmade cookies, featuring chocolate chip cookies and the headline “Our Cookies”.'},
  {src:'/posters/03-cinnamon-buns.png',alt:'The Sourdough Bakery poster for cinnamon buns, featuring a glazed bun and the headline “Our Cinnamon Buns”.'},
  {src:'/posters/04-sourdough-pizza.png',alt:'The Sourdough Bakery poster for sourdough pizza, featuring a fresh pizza and the headline “Our Pizza”.'},
  {src:'/posters/05-sourdough-specials.png',alt:'The Sourdough Bakery poster for sourdough specials, featuring breads, cookies, cinnamon buns and pizza.'},
  {src:'/posters/06-ultimate-sourdough-experience.png',alt:'The Sourdough Bakery poster for the ultimate sourdough experience, featuring bread, cookies, cinnamon buns and pizza.'},
 ]
 const home=<><section className="hero" aria-label="Featured bakery posters"><div className="hero-track" style={{transform:`translateX(-${slide*100}%)`}}>{slides.map((s,i)=><div className="hero-slide" key={s.src} role="group" aria-roledescription="slide" aria-label={`Poster ${i+1} of ${slides.length}`}><img src={s.src} alt={s.alt}/></div>)}</div><button className="hero-arrow hero-prev" aria-label="Previous poster" onClick={()=>setSlide((slide+slides.length-1)%slides.length)}><ArrowLeft/></button><button className="hero-arrow hero-next" aria-label="Next poster" onClick={()=>setSlide((slide+1)%slides.length)}><ArrowRight/></button></section><div className="hero-cta"><p>Good bread takes time. Find your new favourite bake.</p><ButtonLink href="/shop">Shop the bakery</ButtonLink></div><section className="intro-strip"><div><span className="eyebrow">01 — THE CRAFT</span><h3>Artisan<br/>baking</h3><p>Thoughtful hands. Beautifully patient dough.</p></div><div><span className="eyebrow">02 — THE DETAILS</span><h3>Thoughtfully<br/>crafted</h3><p>Made with care, from first fold to final crust.</p></div><div><span className="eyebrow">03 — THE GATHERING</span><h3>Made for<br/>every occasion</h3><p>Everyday rituals and the moments worth sharing.</p></div></section><section className="section collection-section"><div className="section-heading"><div><span className="eyebrow">A TABLE FULL OF GOOD THINGS</span><h2>Find your <em>favourite.</em></h2></div><Link href="/shop" className="text-link">Explore all collections <ArrowRight size={16}/></Link></div><div className="collection-grid">{categories.map((c,i)=><Link href={`/collection/${c.name.toLowerCase().replaceAll(' ','-').replaceAll('&','and')}`} className={`collection-card collection-${i}`} key={c.name}><img src={c.image} alt=""/><div><span>0{i+1} / COLLECTION</span><h3>{c.label}</h3><p>{c.blurb}</p><b>Shop collection <ArrowUpRight size={16}/></b></div></Link>)}</div></section><section className="section bestsellers"><div className="section-heading"><div><span className="eyebrow">MADE FRESH, EVERY DAY</span><h2>Most <em>loved.</em></h2></div><ButtonLink href="/shop" variant="line">Shop all</ButtonLink></div><ProductGrid items={products.filter(p=>p.tag==='Bestseller').slice(0,4)} onAdd={add}/></section><section className="story-band" style={{backgroundImage:'url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/background-0gLn0ST2otrUowuLN6YayM1XlEvgVg.jpg")'}} aria-labelledby="sourdough-art-title"><div><span className="eyebrow">A LITTLE PATIENCE MAKES A LOT OF DIFFERENCE</span><h2 id="sourdough-art-title">The art of<br/><em>sourdough.</em></h2><p>Time is our most important ingredient. We give our dough the space to develop, our bakers the freedom to follow their craft, and every loaf the attention it deserves.</p><ButtonLink href="/story" variant="light">Discover our story</ButtonLink></div></section><section className="specials section"><div className="special-intro"><span className="eyebrow">FOR THE BEAUTIFUL IN-BETWEEN</span><h3>Good things,<br/>made to <em>share.</em></h3><p>Small-batch treats and thoughtful boxes to make an ordinary afternoon feel a little more special.</p></div><div className="special-image"><img src="/special-doughnuts.png" alt="Top-down view of creamy doughnuts in an open bakery box, with the lid set aside."/><div className="special-copy"><span className="eyebrow">A LITTLE SOMETHING FROM THE BAKERY</span><h2>Something a little <em>special.</em></h2><p>Thoughtful boxes and small-batch bakes, made for the moments worth sharing.</p><ButtonLink href="/collection/sourdough-specials" variant="light">Explore the specials</ButtonLink></div></div></section><section className="cake-feature" aria-labelledby="cake-feature-title"><img src="/cakes-gallery-overhead.png" alt="Overhead view of an ivory wedding cake, a pink birthday cake with candles, and buttercream cupcakes."/><div className="cake-feature-copy"><span className="eyebrow">MADE TO MARK YOUR MOMENT</span><h2 id="cake-feature-title">Cakes for life&apos;s<br/><em>sweetest moments.</em></h2><p>From elegant wedding cakes and joyful birthday bakes to delicate cupcakes, each creation is made to order, finished by hand, and baked with care.</p><ul className="cake-types"><li>Wedding cakes</li><li>Birthday cakes</li><li>Cupcakes</li></ul><ButtonLink href="/custom-orders" variant="light">Enquire about a cake</ButtonLink></div></section><section className="custom-callout"><span className="eyebrow">A GATHERING ON THE HORIZON?</span><h2>Let&apos;s make it <em>memorable.</em></h2><p>Celebrations, corporate tables, and the big loaf order. Tell us what you have in mind.</p><ButtonLink href="/custom-orders" variant="light">Request a custom order</ButtonLink></section><section className="testimonials section"><span className="eyebrow">KIND WORDS · DEMO TESTIMONIALS</span><h2>Good things are <em>meant to be shared.</em></h2><div className="quote-grid"><blockquote>“That first slice, still warm from the bag, was a little moment of joy.”<cite>DEMO CUSTOMER · KAMPALA</cite></blockquote><blockquote>“Beautifully made and somehow gone before the coffee was finished.”<cite>DEMO CUSTOMER · KAMPALA</cite></blockquote><blockquote>“The kind of bread that makes everyone linger at the table.”<cite>DEMO CUSTOMER · KAMPALA</cite></blockquote></div></section><section className="gallery"><div><span className="eyebrow">LITTLE MOMENTS FROM OUR KITCHEN</span><h2>Fresh from the <em>oven.</em></h2></div>{['photo-1585478259715-876acc5be8eb','photo-1499636136210-6f4ee915583e','photo-1555507036-ab1f4038808a','photo-1509365465985-25d11c17e812','photo-1608198093002-ad4e005484df'].map((id,i)=><img key={id} src={photo(id,500)} alt={['Sourdough loaf','Fresh cookies','Croissant','Cinnamon roll','Bakery assortment'][i]}/>)}</section><Newsletter/></>
 let content: React.ReactNode = home
 if(segment==='shop'||segment==='collection') content=<ShopPage key={`${segment}:${path[1]||'all'}`} items={segment==='collection'?collectionItems:products} title={category?.label||'The bakery shop'} intro={category?.blurb||'A little something for every table. Explore our small-batch bakes, made fresh with time and care.'} add={add}/>
 if(segment==='product') content=product?<ProductDetail item={product} add={add}/>:<NotFound/>
 if(segment==='bag') content=catalogUnavailable?<div className="empty-state"><ShoppingBag size={32}/><h2>Your saved bag is waiting.</h2><p>The catalog could not be loaded, so product prices and details cannot be verified yet.</p></div>:<BagPage products={cartProducts} bag={bag} subtotal={subtotal} qty={qty} remove={id=>setBag(b=>b.filter(x=>x.id!==id))}/>
 if(segment==='checkout') content=catalogUnavailable?<div className="empty-state"><h2>Checkout is temporarily unavailable.</h2><p>The product catalog must load before this demo checkout can continue.</p></div>:<Checkout products={cartProducts} bag={bag} subtotal={subtotal} clear={()=>setBag([])} router={router}/>
 if(segment==='confirmation') content=<Confirmation/>
 if(segment==='story') content=<StoryPage/>
 if(segment==='custom-orders') content=<EnquiryForm custom contacts={settings.contacts}/>
 if(segment==='contact') content=<EnquiryForm contacts={settings.contacts}/>
 return <><Header count={count} companyName={companyName} logoUrl={settings.logoUrl}/><main>{catalogUnavailable&&<div className="catalog-notice" role="status">{catalogError||'The product catalog is temporarily unavailable.'}</div>}{catalogRefreshError&&<div className="catalog-notice" role="status">Could not refresh the catalog. Showing the last loaded products.</div>}{settingsError&&<div className="catalog-notice" role="status">{settingsError}</div>}{content}</main><Footer companyName={companyName} logoUrl={settings.logoUrl} contacts={settings.contacts}/>{toast&&<div className="toast" role="status"><Check size={16}/>{toast}</div>}</>
}

const MAX_PRICE_FILTER = 500_000
const PRICE_FILTER_STEP = 1_000

function ShopPage({items,title,intro,add}:{items:Product[];title:string;intro:string;add:(p:Product,v?:StorefrontVariant)=>void}) {
 const flavours=Array.from(new Set(items.map(product=>product.flavour).filter(Boolean))).sort()
 const availableCategories=Array.from(new Set(items.map(product=>product.category)))
 const [query,setQuery]=useState('')
 const [cat,setCat]=useState('All')
 const [flavour,setFlavour]=useState('All')
 const [sort,setSort]=useState('Featured')
 const [max,setMax]=useState(MAX_PRICE_FILTER)
 const searchQuery=query.trim().toLowerCase()
 const priceProgress=Math.min(100,Math.max(0,max/MAX_PRICE_FILTER*100))
 const hasActiveFilters=Boolean(searchQuery||cat!=='All'||flavour!=='All'||max<MAX_PRICE_FILTER||sort!=='Featured')
 const clearFilters=()=>{setQuery('');setCat('All');setFlavour('All');setMax(MAX_PRICE_FILTER);setSort('Featured')}
 const filtered=items.filter(product=>{
  const searchText=[product.name,product.description,product.category,product.flavour,product.ingredientsStatement,...product.allergens,...product.variants.flatMap(variant=>[variant.name,variant.sku,variant.saleUnit])].join(' ').toLowerCase()
  return (cat==='All'||product.category===cat)&&(flavour==='All'||product.flavour===flavour)&&searchText.includes(searchQuery)&&product.variants.some(variant=>variant.price<=max)
 }).sort((a,b)=>{
  if(sort==='Price: Low to High') return productPrice(a)-productPrice(b)
  if(sort==='Price: High to Low') return productPrice(b)-productPrice(a)
  if(sort==='Bestselling') return Number(b.badges.includes('bestseller'))-Number(a.badges.includes('bestseller'))
  if(sort==='Newest') return (b.firstPublishedAt||'').localeCompare(a.firstPublishedAt||'')
  return 0
 })
 return <section className="shop-page">
  <div className="shop-hero">
   <span className="eyebrow"><Link href="/">HOME</Link> &nbsp; / &nbsp; SHOP</span>
   <h1>{title.split(' ').slice(0,-1).join(' ')} <em>{title.split(' ').slice(-1)}</em></h1>
   <p>{intro}</p>
  </div>
  <div className="shop-controls">
   <label className="search-field"><Search size={17}/><input aria-label="Search products" placeholder="Search the bakery" value={query} onChange={e=>setQuery(e.target.value)}/></label>
   <select aria-label="Filter by category" value={cat} onChange={e=>setCat(e.target.value)}>
    <option value="All">All categories</option>{availableCategories.map(name=><option key={name}>{name}</option>)}
   </select>
   <select aria-label="Filter by flavour" value={flavour} onChange={e=>setFlavour(e.target.value)}>
    <option value="All">All flavours</option>{flavours.map(item=><option key={item}>{item}</option>)}
   </select>
   <label className="price-filter">
    <span>Up to {money(max)}</span>
    <input aria-label="Maximum price" type="range" min="0" max={MAX_PRICE_FILTER} step={PRICE_FILTER_STEP} value={max} style={{background:`linear-gradient(to right, var(--olive) 0%, var(--olive) ${priceProgress}%, var(--border) ${priceProgress}%, var(--border) 100%)`}} onChange={e=>setMax(Number(e.target.value))}/>
   </label>
   <select aria-label="Sort products" value={sort} onChange={e=>setSort(e.target.value)}>
    <option>Featured</option><option>Bestselling</option><option>Price: Low to High</option><option>Price: High to Low</option><option>Newest</option>
   </select>
  </div>
  <div className="results-line">Showing {filtered.length} of {items.length} published products <span>Active and published catalog items</span>{hasActiveFilters&&<button type="button" className="filter-reset" onClick={clearFilters}>Clear filters</button>}</div>
  {filtered.length?<ProductGrid items={filtered} onAdd={add}/>:<div className="empty-state"><h2>{items.length?'No crumbs found.':'No published products yet.'}</h2><p>{items.length?'Try a different search or filter.':'Please check back soon for fresh bakes.'}</p></div>}
  <style jsx>{`
  .price-filter input[type="range"]{appearance:none;width:min(180px,55vw);height:6px;padding:0;border-radius:999px;cursor:pointer;touch-action:pan-y}
  .price-filter input[type="range"]::-webkit-slider-runnable-track{height:6px;background:transparent;border-radius:999px}
  .price-filter input[type="range"]::-webkit-slider-thumb{appearance:none;width:16px;height:16px;margin-top:-5px;border:2px solid var(--ivory);border-radius:50%;background:var(--olive);box-shadow:0 1px 5px #30231d40;cursor:grab}
  .price-filter input[type="range"]::-moz-range-track{height:6px;background:transparent;border:0;border-radius:999px}
  .price-filter input[type="range"]::-moz-range-thumb{width:12px;height:12px;border:2px solid var(--ivory);border-radius:50%;background:var(--olive);box-shadow:0 1px 5px #30231d40;cursor:grab}
  .price-filter input[type="range"]:active::-webkit-slider-thumb{cursor:grabbing}
  .price-filter input[type="range"]:active::-moz-range-thumb{cursor:grabbing}
  .price-filter input[type="range"]:focus-visible{outline:2px solid var(--olive);outline-offset:4px}
  .filter-reset{flex:none;padding:0;border:0;background:transparent;color:var(--olive);font:inherit;text-decoration:underline;cursor:pointer}
  @media(max-width:640px){.results-line{flex-wrap:wrap}.filter-reset{margin-left:auto}}
 `}</style></section>
}
function ProductDetail({item,add}:{item:Product;add:(p:Product,v?:StorefrontVariant)=>void}) {
 const [quantity,setQuantity]=useState(1)
 const [variantId,setVariantId]=useState(item.variants[0]?.id ?? '')
 const variant=item.variants.find(option=>option.id===variantId) ?? item.variants[0]
 return <section className="product-detail"><div className="detail-image"><img src={item.image} alt={productImageAlt(item)}/><span className="eyebrow">FRESHLY BAKED · MADE WITH CARE</span></div><div className="detail-copy"><span className="eyebrow"><Link href="/shop">SHOP</Link> / {item.category.toUpperCase()}</span><h1>{item.name}</h1>{item.badges.map(badge=><span className="product-tag" key={badge}>{badge==='bestseller'?'Bestseller':'New'}</span>)}{item.variants.length>1&&<label className="variant-picker">Choose an option<select value={variant?.id ?? ''} onChange={event=>setVariantId(event.target.value)}>{item.variants.map(option=><option key={option.id} value={option.id}>{option.name} · {option.saleUnit}</option>)}</select></label>}<div className="detail-price">{variant?money(variant.price):'Unavailable'}</div><p className="detail-description">{item.description}</p><div className="availability"><span/> Published in the catalog; demo checkout only</div><div className="quantity-control"><button onClick={()=>setQuantity(Math.max(1,quantity-1))} aria-label="Decrease quantity"><Minus size={16}/></button><span>{quantity}</span><button onClick={()=>setQuantity(quantity+1)} aria-label="Increase quantity"><Plus size={16}/></button></div><button className="button button-dark add-wide" disabled={!variant} onClick={()=>{if(variant) Array.from({length:quantity},()=>add(item,variant))}}>Add to bag — {money((variant?.price ?? 0)*quantity)} <ShoppingBag size={17}/></button><div className="product-notes"><details><summary>Ingredients & allergens <ChevronDown size={16}/></summary><p>{item.ingredientsStatement || 'Ingredient information has not been provided.'}</p>{item.allergens.length>0&&<p>Allergens: {item.allergens.join(', ')}</p>}</details><details><summary>Collection & delivery <ChevronDown size={16}/></summary><p>Choose collection or delivery at checkout. Scheduling is subject to confirmation.</p></details></div><Link href="/shop" className="text-link back-link"><ArrowLeft size={15}/> Back to the shop</Link></div></section>
}
function BagPage({products,bag,subtotal,qty,remove}:{products:Product[];bag:BagLine[];subtotal:number;qty:(id:string,n:number)=>void;remove:(id:string)=>void}) { return <section className="bag-page"><span className="eyebrow">YOUR LITTLE COLLECTION</span><h1>The shopping <em>bag.</em></h1>{!bag.length?<div className="empty-state"><ShoppingBag size={32}/><h2>It&apos;s a little quiet in here.</h2><p>Your next favourite bake is just around the corner.</p><ButtonLink href="/shop">Explore the bakery</ButtonLink></div>:<div className="bag-layout"><div className="bag-items">{bag.map(line=>{const entry=cartItemFor(products,line.id);if(!entry)return null;const {product,variant}=entry;return <article key={line.id} className="bag-item"><img src={product.image} alt={productImageAlt(product)}/><div className="bag-item-copy"><Link href={`/product/${product.slug}`}>{product.name}</Link><span>{variant.name} · {variant.saleUnit}</span><b>{money(variant.price)}</b><div className="quantity-control"><button aria-label="Decrease quantity" onClick={()=>qty(line.id,-1)}><Minus size={14}/></button><span>{line.quantity}</span><button aria-label="Increase quantity" onClick={()=>qty(line.id,1)}><Plus size={14}/></button></div></div><div className="bag-item-end"><b>{money(variant.price*line.quantity)}</b><button className="remove-link" onClick={()=>remove(line.id)}>Remove</button></div></article>})}</div><aside className="bag-summary"><h2>Order summary</h2><p><span>Subtotal</span><b>{money(subtotal)}</b></p><small>Delivery or collection details are selected at checkout.</small><div className="summary-total"><span>Total</span><b>{money(subtotal)}</b></div><ButtonLink href="/checkout">Continue to checkout</ButtonLink><Link href="/shop" className="continue-link">Continue shopping</Link></aside></div>}</section> }
function Checkout({products,bag,subtotal,clear,router}:{products:Product[];bag:BagLine[];subtotal:number;clear:()=>void;router:ReturnType<typeof useRouter>}) { const [fulfil,setFulfil]=useState('Collection');const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [form,setForm]=useState({name:'',phone:'',email:'',address:'',area:'',date:'',time:'',payment:'Pay on Collection',instructions:''});const delivery=fulfil==='Delivery';const total=subtotal+(delivery?8000:0);const update=(key:string,value:string)=>setForm(f=>({...f,[key]:value}));const submit=async(e:React.FormEvent)=>{e.preventDefault();if(!bag.length){setError('Your bag is empty. Add something delicious first.');return}setError('');setBusy(true);await new Promise(r=>setTimeout(r,900));try{localStorage.setItem('sourdough-last-order',JSON.stringify({ref:`SDB-${Date.now().toString().slice(-7)}`,form,fulfil,total,items:bag}))}catch{}clear();router.push('/confirmation');setBusy(false)}; return <section className="checkout-page"><span className="eyebrow">A FEW DETAILS, THEN THE GOOD PART</span><h1>Almost <em>yours.</em></h1><form className="checkout-layout" onSubmit={submit}><div className="checkout-fields"><fieldset><legend>01 — Your details</legend><div className="form-grid"><label>Full name<input required value={form.name} onChange={e=>update('name',e.target.value)} placeholder="Your name"/></label><label>Phone number<input required type="tel" value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="+256"/></label><label className="full-field">Email address<input required type="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="you@example.com"/></label></div></fieldset><fieldset><legend>02 — How would you like it?</legend><div className="choice-row">{['Collection','Delivery'].map(x=><button type="button" key={x} onClick={()=>setFulfil(x)} className={`choice ${fulfil===x?'selected':''}`}><span>{fulfil===x?<Check size={14}/>:null}</span>{x}</button>)}</div>{delivery&&<div className="form-grid delivery-fields"><label>Delivery address<input required value={form.address} onChange={e=>update('address',e.target.value)} placeholder="Street and building"/></label><label>Area / neighbourhood<input required value={form.area} onChange={e=>update('area',e.target.value)} placeholder="Your area"/></label><label className="full-field">Delivery instructions<textarea value={form.instructions||''} onChange={e=>update('instructions',e.target.value)} placeholder="Anything we should know?" rows={3}/></label></div>}<div className="form-grid schedule-fields"><label>Preferred date<input required type="date" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={e=>update('date',e.target.value)}/></label><label>Time slot<select required value={form.time} onChange={e=>update('time',e.target.value)}><option value="">Choose a time</option><option>9:00 – 11:00</option><option>11:00 – 13:00</option><option>13:00 – 15:00</option><option>15:00 – 17:00</option></select></label></div></fieldset><fieldset><legend>03 — Demo payment preference</legend><p className="payment-note">No payment is collected. This is a demonstration checkout.</p><div className="choice-row">{['Mobile Money','Card','Pay on Collection'].map(x=><button type="button" key={x} onClick={()=>update('payment',x)} className={`choice ${form.payment===x?'selected':''}`}><span>{form.payment===x?<Check size={14}/>:null}</span>{x}</button>)}</div></fieldset>{error&&<p className="form-error" role="alert">{error}</p>}<button className="button button-dark place-order" disabled={busy}>{busy?'Preparing your demo order…':`Place demo order · ${money(total)}`}<ArrowRight size={17}/></button></div><aside className="checkout-summary"><h2>Your order</h2>{bag.length?bag.map(line=>{const p=products.find(x=>x.id===line.id)!;return <div className="checkout-item" key={line.id}><img src={p.image} alt=""/><span>{p.name} <small>× {line.quantity}</small></span><b>{money(p.price*line.quantity)}</b></div>}):<p>Your bag is empty.</p>}<div className="summary-row"><span>Subtotal</span><b>{money(subtotal)}</b></div><div className="summary-row"><span>{delivery?'Delivery fee':'Collection'}</span><b>{delivery?money(8000):'Free'}</b></div><div className="summary-total"><span>Total</span><b>{money(total)}</b></div><small>Demonstration order only. No payment will be processed.</small></aside></form></section> }
function Confirmation() {const [order,setOrder]=useState<{ref:string;form:{name:string;email:string;phone:string;date:string;time:string};fulfil:string;total:number;items:BagLine[]}|null>(null);useEffect(()=>{try{const v=localStorage.getItem('sourdough-last-order');if(v)setOrder(JSON.parse(v))}catch{}},[]);return <section className="confirmation"><div className="success-mark"><Check size={24}/></div><span className="eyebrow">DEMONSTRATION ORDER</span><h1>Thank you for<br/><em>thinking of us.</em></h1><p>Your demonstration order has been prepared. No payment was taken and the bakery has not received this request.</p>{order&&<div className="confirmation-card"><div><span>DEMO ORDER NUMBER</span><b>{order.ref}</b></div><div><span>ORDER FOR</span><b>{order.form.name}</b></div><div><span>FULFILMENT</span><b>{order.fulfil} · {order.form.date} · {order.form.time}</b></div><div><span>TOTAL</span><b>{money(order.total)}</b></div></div>}<ButtonLink href="/shop">Continue shopping</ButtonLink></section> }
function StoryPage(){return <><section className="inner-hero story-hero"><img src={photo('photo-1549931319-a545dcf3bc73',1600)} alt="Freshly baked artisan sourdough"/><div><span className="eyebrow">A GOOD THING TAKES TIME</span><h1>Our story is<br/><em>still rising.</em></h1></div></section><section className="story-text section"><div><span className="eyebrow">THE SOURDOUGH BAKERY</span><h2>Good bread begins<br/>with a little <em>patience.</em></h2></div><div><p>We believe the simplest things are often the most meaningful. Flour, water, salt, and time become something worth gathering around when they are met with a thoughtful hand.</p><p>At The SourDough Bakery, our approach is grounded in craft. We tend our dough, shape each loaf by hand, and bake in small batches so that every detail has room to matter.</p><p>No grand origin story. Just a love of good baking, and the quiet pleasure of sharing it.</p><ButtonLink href="/shop">Find something lovely</ButtonLink></div></section><section className="process-row">{[['01','Mix with care'],['02','Give it time'],['03','Shape by hand'],['04','Share generously']].map(([n,t])=><div key={n}><span>{n}</span><h3>{t}</h3></div>)}</section></>}
function EnquiryForm({custom=false,contacts}:{custom?:boolean;contacts:StorefrontSettings['contacts']}) {
 const [sent,setSent]=useState(false)
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 const [reference,setReference]=useState('')
 const submissionKey=useRef('')
 const [form,setForm]=useState({name:'',email:'',phone:'',orderType:'',requestedProducts:'',estimatedQuantity:'',preferredDate:'',fulfillment:'Collection',message:''})
 const hasContacts=Boolean(contacts.phone||contacts.email||contacts.address)
 const update=(key:keyof typeof form,value:string)=>setForm(current=>({...current,[key]:value}))
 const submit=async(e:React.FormEvent<HTMLFormElement>)=>{
  e.preventDefault()
  setBusy(true)
  setError('')
  if(!submissionKey.current) submissionKey.current=crypto.randomUUID()
  const payload={
   name:form.name,
   email:form.email,
   phone:form.phone,
   subject:custom?'Custom-order enquiry':'Website contact',
   message:form.message,
   ...(custom?{
    orderType:form.orderType,
    requestedProducts:form.requestedProducts,
    estimatedQuantity:form.estimatedQuantity,
    preferredDate:form.preferredDate,
    fulfillment:form.fulfillment,
    requirements:form.message,
   }:{}),
  }
  try{
   const response=await fetch(custom?'/api/storefront/messages/custom-orders':'/api/storefront/messages/contact',{
    method:'POST',
    headers:{'Content-Type':'application/json','Idempotency-Key':submissionKey.current},
    body:JSON.stringify(payload),
   })
   const result:unknown=await response.json()
   if(!response.ok||!result||typeof result!=='object'){
    const reason=result&&typeof result==='object'&&'error'in result&&typeof result.error==='string'?result.error:'We could not send your message. Please try again.'
    throw new Error(reason)
   }
   const responseReference='reference'in result&&typeof result.reference==='string'?result.reference:''
   setReference(responseReference)
   setSent(true)
   submissionKey.current=''
  }catch(reason){
   setError(reason instanceof Error?reason.message:'We could not send your message. Please try again.')
  }finally{
   setBusy(false)
  }
 }
 return <section className="enquiry-page"><div className="enquiry-intro"><span className="eyebrow">{custom?'MADE FOR YOUR MOMENT':'WE WOULD LOVE TO HEAR FROM YOU'}</span><h1>{custom?<>A little something <em>extraordinary.</em></>:<>Let&apos;s <em>talk.</em></>}</h1><p>{custom?'From celebrations to a table full of bread, tell us what you are dreaming up. Our team will follow up to discuss the details.':'Questions about an order, a loaf, or what is fresh today? Leave us a note and we will be in touch.'}</p>{!custom&&hasContacts&&<div className="contact-details">{contacts.phone&&<a href={`tel:${encodeURIComponent(contacts.phone)}`}>Phone · {contacts.phone}</a>}{contacts.email&&<a href={`mailto:${encodeURIComponent(contacts.email)}`}>Email · {contacts.email}</a>}{contacts.address&&<span>Address · {contacts.address}</span>}</div>}</div>{sent?<div className="form-success"><span className="success-mark"><Check/></span><h2>{custom?'Your enquiry is in our inbox.':'Thank you for reaching out.'}</h2><p>{custom?'This is an enquiry, not a confirmed order. Our team will review your details and follow up to discuss availability, pricing, and timing.':'Your message has been received. Our team will follow up using the email address you provided.'}</p>{reference&&<p className="communication-reference">Reference <strong>{reference}</strong></p>}<ButtonLink href="/">Back to home</ButtonLink></div>:<form className="enquiry-form" onSubmit={submit}><span className="eyebrow">{custom?'TELL US A LITTLE MORE':'SEND A NOTE'}</span><h2>{custom?'Your idea, our favourite kind of brief.':'How can we help?'}</h2><label>Your name<input required maxLength={180} value={form.name} onChange={e=>update('name',e.target.value)} placeholder="Your name"/></label><div className="form-grid"><label>Email<input required type="email" maxLength={254} value={form.email} onChange={e=>update('email',e.target.value)} placeholder="you@example.com"/></label><label>Phone<input type="tel" maxLength={40} value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="+256"/></label></div>{custom&&<><label>Order type<select required value={form.orderType} onChange={e=>update('orderType',e.target.value)}><option value="" disabled>Select an occasion</option>{['Birthday orders','Weddings & celebrations','Corporate orders','Events & catering','Bulk bread orders','Other'].map(x=><option key={x}>{x}</option>)}</select></label><label>What would you like?<input required maxLength={1000} value={form.requestedProducts} onChange={e=>update('requestedProducts',e.target.value)} placeholder="Products or ideas"/></label><div className="form-grid"><label>Estimated quantity<input type="number" min="1" step="1" value={form.estimatedQuantity} onChange={e=>update('estimatedQuantity',e.target.value)} placeholder="For how many?"/></label><label>Preferred date<input type="date" value={form.preferredDate} onChange={e=>update('preferredDate',e.target.value)}/></label></div><label>Collection or delivery<select value={form.fulfillment} onChange={e=>update('fulfillment',e.target.value)}><option>Collection</option><option>Delivery</option></select></label></>}<label>{custom?'Additional requirements':'Your message'}<textarea required maxLength={10000} rows={5} value={form.message} onChange={e=>update('message',e.target.value)} placeholder="Write your message here…"/></label>{error&&<p className="form-error" role="alert">{error}</p>}<button className="button button-dark" disabled={busy}>{busy?'Sending…':custom?'Send your enquiry':'Send message'}<ArrowRight size={16}/></button><small>{custom?'Your details will be saved as an enquiry, not an order.':'Your message will be sent securely to the bakery team.'}</small></form>}</section>
}
function Newsletter(){
 const [email,setEmail]=useState('')
 const [consent,setConsent]=useState(false)
 const [status,setStatus]=useState('')
 const [error,setError]=useState('')
 const [busy,setBusy]=useState(false)
 const submit=async(e:React.FormEvent<HTMLFormElement>)=>{
  e.preventDefault()
  setBusy(true)
  setError('')
  setStatus('')
  try{
   const response=await fetch('/api/storefront/newsletter/subscribe',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({email,consent}),
   })
   const result:unknown=await response.json()
   if(!response.ok||!result||typeof result!=='object'){
    const reason=result&&typeof result==='object'&&'error'in result&&typeof result.error==='string'?result.error:'We could not submit your subscription. Please try again.'
    throw new Error(reason)
   }
   setStatus('If this address can be subscribed, you will receive an email with a verification link.')
   setEmail('')
   setConsent(false)
  }catch(reason){
   setError(reason instanceof Error?reason.message:'We could not submit your subscription. Please try again.')
  }finally{
   setBusy(false)
  }
 }
 return <section className="newsletter"><div><span className="eyebrow">A NOTE FROM THE BAKERY</span><h2>A little good in your <em>inbox.</em></h2><p>Fresh bakes, small news, and reasons to gather.</p></div><form onSubmit={submit}><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" required maxLength={254} placeholder="Your email address" value={email} onChange={e=>setEmail(e.target.value)}/><button type="submit" aria-label="Subscribe to newsletter" disabled={busy}>{busy?'…':<ArrowRight/>}</button><label className="newsletter-consent"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>I agree to receive occasional bakery news and offers. I can unsubscribe at any time.</span></label>{status&&<span className="newsletter-status" role="status">{status}</span>}{error&&<span className="newsletter-status form-error" role="alert">{error}</span>}</form></section>
}
function NotFound(){return <div className="empty-state"><h1>That bake is out of the oven.</h1><p>We couldn&apos;t find this page, but there are plenty more good things.</p><ButtonLink href="/shop">Visit the shop</ButtonLink></div>}
