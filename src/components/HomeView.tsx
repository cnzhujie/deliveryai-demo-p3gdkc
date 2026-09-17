import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronRight, MapPin, QrCode, Sparkles, Users } from 'lucide-react'
import hotpot from '@/assets/hotpot.jpg'
import { products } from '@/data/menu'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { money } from '@/lib/utils'
import type { Product } from '@/types'

const tableOptions = [
  { code: 'A08', areaKey: 'bind.area.hall', seats: 4 },
  { code: 'B12', areaKey: 'bind.area.booth', seats: 6 },
  { code: 'C06', areaKey: 'bind.area.room', seats: 4 },
  { code: 'D03', areaKey: 'bind.area.window', seats: 6 },
]

interface HomeViewProps { soldOut: string[]; onBind: (table: string) => void }

export function HomeView({ soldOut, onBind }: HomeViewProps) {
  const { t } = useTranslation()
  const tableRef = useRef<HTMLElement>(null)
  const [selected, setSelected] = useState<Product | null>(null)
  const [showHint, setShowHint] = useState(false)

  const recommendedProducts = products.filter((p) => p.badge)

  const handleOrderNow = () => {
    setSelected(null)
    setShowHint(true)
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => setShowHint(false), 3000)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-rice-100 paper-noise">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-chili-100 blur-3xl" />
      <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-amber-100 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-5 py-10 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <section className="animate-rise">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-chili-500/20 bg-white/80 px-3 py-2 text-xs font-bold text-chili-600 shadow-sm">
              <Sparkles size={14} /> {t('common.concept_badge')}
            </div>
            <p className="mb-3 text-sm font-bold tracking-widest text-chili-500">{t('common.concept_en')}</p>
            <h1 className="max-w-xl text-4xl font-extrabold leading-tight text-charcoal-900 sm:text-5xl lg:text-6xl">
              {t('bind.title_l1')}<br /><span className="text-chili-500">{t('bind.title_l2')}</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-charcoal-500">{t('bind.desc')}</p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm text-charcoal-700">
              {[t('bind.feature1'), t('bind.feature2'), t('bind.feature3')].map((item) => (
                <span key={item} className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm"><Check size={15} className="text-chili-500" />{item}</span>
              ))}
            </div>
          </section>

          <section ref={tableRef} className="animate-rise rounded-3xl border border-white/80 bg-white/90 p-4 shadow-float backdrop-blur sm:p-6">
            <div className="relative mb-6 h-48 overflow-hidden rounded-2xl sm:h-56">
              <img src={hotpot} alt={t('bind.img_alt')} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                <div><p className="text-xs opacity-80">{t('common.simulated_store')}</p><h2 className="text-xl font-bold">{t('common.store_name')}</h2></div>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur">{t('common.open')}</span>
              </div>
            </div>
            <div className="mb-4 flex items-center gap-3 rounded-2xl bg-rice-100 p-4">
              <span className="rounded-xl bg-white p-3 text-chili-500 shadow-sm"><QrCode /></span>
              <div className="min-w-0 flex-1"><p className="font-bold text-charcoal-900">{t('bind.qr_title')}</p><p className="text-sm text-charcoal-500">{t('bind.qr_desc')}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {tableOptions.map(({ code, areaKey, seats }, index) => (
                <button key={code} onClick={() => onBind(code)} className="group rounded-2xl border border-charcoal-900/10 bg-white p-4 text-left transition hover:-translate-y-1 hover:border-chili-500 hover:shadow-card">
                  <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-rice-100 text-sm font-extrabold text-chili-500">{index + 1}</span>
                  <p className="font-bold text-charcoal-900">{code} · {t(areaKey)}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-charcoal-500"><Users size={13} /> {t('bind.seats', { count: seats })}</p>
                  <ChevronRight size={17} className="ml-auto mt-2 text-charcoal-500 transition group-hover:translate-x-1 group-hover:text-chili-500" />
                </button>
              ))}
            </div>
            <Button onClick={() => onBind('A08')} className="mt-4 w-full"><MapPin size={17} />{t('bind.quick_enter')}</Button>
            {showHint && <p className="mt-3 text-center text-sm font-bold text-chili-500">{t('home.select_table_hint')}</p>}
          </section>
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-extrabold text-charcoal-900">{t('home.recommended_title')}</h2>
          {recommendedProducts.length === 0 ? (
            <p className="text-sm text-charcoal-500">{t('home.no_recommendations')}</p>
          ) : (
            <div className="scrollbar-none -mx-5 flex gap-4 overflow-x-auto px-5 pb-2 lg:mx-0 lg:px-0">
              {recommendedProducts.map((product, index) => {
                const unavailable = soldOut.includes(product.id)
                return (
                  <article
                    key={product.id}
                    onClick={() => !unavailable && setSelected(product)}
                    className={`group animate-rise w-64 shrink-0 overflow-hidden rounded-3xl border border-charcoal-900/5 bg-white shadow-card transition hover:-translate-y-1 ${unavailable ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="relative h-36 overflow-hidden">
                      <img src={product.image} alt={t(product.name)} className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${unavailable ? 'grayscale' : ''}`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/45 to-transparent" />
                      {product.badge && <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-charcoal-900">{t(product.badge)}</span>}
                      {unavailable && <span className="absolute inset-0 flex items-center justify-center bg-white/55 text-lg font-extrabold text-charcoal-900 backdrop-blur-sm">{t('menu.sold_out')}</span>}
                    </div>
                    <div className="p-4">
                      <h3 className="font-extrabold text-charcoal-900">{t(product.name)}</h3>
                      <p className="mt-1 line-clamp-1 text-xs text-charcoal-500">{t(product.description)}</p>
                      <p className="mt-3 text-lg font-extrabold text-chili-500">{money(product.price)}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <DialogContent title={selected ? t(selected.name) : ''}>
          {selected && (
            <>
              <div className="mt-4 flex gap-4 rounded-2xl bg-white p-3">
                <img src={selected.image} alt={t(selected.name)} className="h-24 w-24 rounded-xl object-cover" />
                <div>
                  {selected.badge && <span className="mb-2 inline-block rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-charcoal-900">{t(selected.badge)}</span>}
                  <p className="text-sm leading-6 text-charcoal-500">{t(selected.description)}</p>
                  <p className="mt-2 text-xl font-extrabold text-chili-500">{money(selected.price)}</p>
                </div>
              </div>
              <Button onClick={handleOrderNow} className="mt-6 w-full">{t('home.order_now')}</Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
