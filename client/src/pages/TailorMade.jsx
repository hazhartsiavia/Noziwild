import React, { useState } from 'react'
import Ramena from '../assets/images/Ramena.png'
import NosyIranja from '../assets/images/NosyIranja.png'
import NosyLonjo from '../assets/images/NosyLonjo.png'
import Ambanja from '../assets/images/Ambanja.png'
import Deux from '../assets/images/2.jpg'
import Tana from '../assets/images/Tana.png'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const W = 'w-[90vw] lg:max-w-[95vw]'
const GOLD = 'bg-[#C49849] hover:bg-[#a9813a]'
const BTN = 'inline-flex items-center justify-center text-sm md:text-base font-medium px-6 py-3 rounded-full active:scale-95 transition disabled:opacity-40 disabled:pointer-events-none'
const H2 = 'text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight text-slate-900'
const FIELD = 'w-full h-12 rounded-full border border-slate-300 bg-white px-5 text-base text-slate-800 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700'
const LABEL = 'block mb-2 text-sm md:text-base text-slate-700'

/* ---------------------------- Données ---------------------------- */

const interests = [
  { id: 'Islands & beaches', image: NosyIranja },
  { id: 'Wildlife', image: Ambanja },
  { id: 'Culture & villages', image: Tana },
  { id: 'Hiking & adventure', image: Deux },
  { id: 'Sailing & sea', image: Ramena },
  { id: 'Slow & relaxing', image: NosyLonjo },
]
const lengths = ['1 week', '2 weeks', '3 weeks', '1 month or more']
const months = ['Not sure yet', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const paces = ['Slow', 'Balanced', 'Active']
const comforts = ['Comfortable', 'Premium', 'Luxury']
const groups = ['Solo', 'Couple', 'Family', 'Friends']

const steps = [
  { title: 'Tell us your wishes', text: 'Answer a few questions or write to us freely.' },
  { title: 'Get a first proposal', text: 'A travel expert sends a day-by-day route within a few days.' },
  { title: 'Refine together', text: 'Change anything until the trip feels exactly right.' },
  { title: 'Travel with support', text: 'Local guides, transfers and a contact on the ground.' },
]

const ideas = [
  { title: 'Romantic islands', text: 'Sandbars, sunsets and quiet stays.', image: NosyIranja, preset: { interests: ['Islands & beaches', 'Slow & relaxing'], group: 'Couple' } },
  { title: 'Family wildlife trail', text: 'Lemurs, forests and gentle adventure.', image: Ambanja, preset: { interests: ['Wildlife', 'Hiking & adventure'], group: 'Family' } },
  { title: 'Culture and countryside', text: 'Markets, royal hills and village life.', image: Tana, preset: { interests: ['Culture & villages', 'Wildlife'], group: 'Friends' } },
]

/* -------------------------- Composants --------------------------- */

function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-5 py-2.5 text-sm md:text-base transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2 ${
        active ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-slate-500'
      }`}
    >
      {children}
    </button>
  )
}

function Hero() {
  const arch = 'object-cover w-full rounded-t-[999px] rounded-b-[1.5rem]'
  return (
    <>
      <Navbar />
      <section className={`${W} mt-6 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center`}>
        <div>
          <p className="text-sm md:text-base text-slate-700 mb-4">Tailor-made stays</p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-[100px] font-semibold leading-[0.95] tracking-tight text-slate-900">Your Madagascar, Your Way</h1>
          <p className="mt-6 text-base md:text-lg text-slate-700 leading-relaxed max-w-xl">No fixed itinerary. Tell us what you love, how long you have and who is travelling. We design the trip around you.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#builder" className={`${BTN} bg-slate-800 hover:bg-slate-700 text-white`}>Design my trip</a>
            <a href="#how" className={`${BTN} border border-slate-400 hover:border-slate-800 text-slate-800`}>How it works</a>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 md:gap-5 items-end">
          <img src={Ambanja} alt="" className={`${arch} h-56 md:h-72`} />
          <img src={NosyIranja} alt="" className={`${arch} h-72 md:h-[26rem]`} />
          <img src={Tana} alt="" className={`${arch} h-48 md:h-60`} />
        </div>
      </section>
    </>
  )
}

function Builder({ form, setForm }) {
  const [step, setStep] = useState(0)
  const [sent, setSent] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggle = (id) => set('interests', form.interests.includes(id) ? form.interests.filter((x) => x !== id) : [...form.interests, id])
  const titles = ['Your interests', 'Time', 'Your style', 'Your details']

  const submit = (e) => {
    e.preventDefault()
    // TODO : envoyer `payload` à votre API ou service d'emails
    const payload = { ...form, ...Object.fromEntries(new FormData(e.currentTarget)) }
    console.log('Tailor-made request:', payload)
    setSent(true)
  }

  const summary = [
    ['Interests', form.interests.join(', ') || 'Not chosen yet'],
    ['Length', form.length],
    ['Month', form.month],
    ['Pace', form.pace],
    ['Comfort', form.comfort],
    ['Travelling', form.group],
  ]

  return (
    <section id="builder" className={`${W} mt-16 md:mt-28 scroll-mt-6 grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6 items-start`}>
      <div className="rounded-[2rem] md:rounded-[3rem] bg-white p-5 sm:p-8 md:p-12">
        {sent ? (
          <div role="status" className="py-8 text-center">
            <h2 className={H2}>Thank you!</h2>
            <p className="mt-4 text-base md:text-lg text-slate-700 max-w-xl mx-auto">Your wishes are with our travel experts. Expect a first proposal by email within a few days.</p>
            <button type="button" onClick={() => { setSent(false); setStep(0) }} className={`${BTN} bg-slate-800 hover:bg-slate-700 text-white mt-8`}>Start another request</button>
          </div>
        ) : (
          <>
            <p className="text-sm md:text-base text-slate-600">Step {step + 1} of 4 · {titles[step]}</p>
            <div className="mt-3 flex gap-2" aria-hidden="true">
              {titles.map((t, i) => <span key={t} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-[#C49849]' : 'bg-slate-200'}`} />)}
            </div>

            {step === 0 && (
              <fieldset className="mt-8">
                <legend className={H2}>What do you love?</legend>
                <p className="mt-2 text-sm md:text-base text-slate-600">Pick as many as you like.</p>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {interests.map((it) => {
                    const on = form.interests.includes(it.id)
                    return (
                      <button key={it.id} type="button" onClick={() => toggle(it.id)} aria-pressed={on}
                        className={`group relative aspect-[4/3] overflow-hidden rounded-[1.5rem] text-left text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-800 ${on ? 'ring-4 ring-[#C49849]' : ''}`}>
                        <img src={it.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className={`absolute inset-0 ${on ? 'bg-slate-950/50' : 'bg-gradient-to-t from-slate-950/80 to-transparent'}`} />
                        <span className="absolute inset-x-0 bottom-0 p-4 text-base md:text-lg font-medium">{it.id}</span>
                        {on && <span aria-hidden="true" className="absolute right-3 top-3 w-7 h-7 rounded-full bg-[#C49849] flex items-center justify-center text-sm">✓</span>}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <div className="mt-8 flex flex-col gap-8">
                <fieldset>
                  <legend className={`${H2} mb-5`}>How long?</legend>
                  <div className="flex flex-wrap gap-3">{lengths.map((l) => <Pill key={l} active={form.length === l} onClick={() => set('length', l)}>{l}</Pill>)}</div>
                </fieldset>
                <div className="max-w-xs">
                  <label htmlFor="month" className={LABEL}>Preferred month</label>
                  <select id="month" value={form.month} onChange={(e) => set('month', e.target.value)} className={FIELD}>
                    {months.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mt-8 flex flex-col gap-8">
                <h2 className={H2}>Your style</h2>
                {[['Pace', 'pace', paces], ['Comfort', 'comfort', comforts], ['Who is travelling?', 'group', groups]].map(([label, key, opts]) => (
                  <fieldset key={key}>
                    <legend className={LABEL}>{label}</legend>
                    <div className="flex flex-wrap gap-3">{opts.map((o) => <Pill key={o} active={form[key] === o} onClick={() => set(key, o)}>{o}</Pill>)}</div>
                  </fieldset>
                ))}
              </div>
            )}

            {step === 3 && (
              <form id="tailor-form" onSubmit={submit} className="mt-8 flex flex-col gap-5">
                <h2 className={H2}>Where do we send your proposal?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label htmlFor="t-name" className={LABEL}>Name</label><input id="t-name" name="name" required autoComplete="name" className={FIELD} /></div>
                  <div><label htmlFor="t-phone" className={LABEL}>Phone (optional)</label><input id="t-phone" name="phone" type="tel" autoComplete="tel" className={FIELD} /></div>
                </div>
                <div><label htmlFor="t-email" className={LABEL}>Email address</label><input id="t-email" name="email" type="email" required autoComplete="email" className={FIELD} /></div>
                <div>
                  <label htmlFor="t-notes" className={LABEL}>Anything else we should know?</label>
                  <textarea id="t-notes" name="notes" rows={4} className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-3 text-base text-slate-800 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700" />
                </div>
              </form>
            )}

            <div className="mt-10 flex items-center justify-between gap-3">
              <button type="button" onClick={() => setStep(step - 1)} disabled={step === 0} className={`${BTN} border border-slate-300 text-slate-800 hover:border-slate-700`}>Back</button>
              {step < 3 ? (
                <button type="button" onClick={() => setStep(step + 1)} disabled={step === 0 && form.interests.length === 0} className={`${BTN} bg-slate-800 hover:bg-slate-700 text-white`}>Next</button>
              ) : (
                <button type="submit" form="tailor-form" className={`${BTN} ${GOLD} text-white`}>Send my wishes</button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Résumé */}
      <aside className="rounded-[2rem] bg-slate-900 text-white p-6 md:p-8 lg:sticky lg:top-6">
        <h3 className="text-xl md:text-2xl font-medium">Your trip so far</h3>
        <dl className="mt-5 flex flex-col gap-4">
          {summary.map(([k, v]) => (
            <div key={k} className="border-t border-white/20 pt-3">
              <dt className="text-xs text-white/60">{k}</dt>
              <dd className="mt-1 text-sm md:text-base">{v}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </section>
  )
}

function TailorMade() {
  const [form, setForm] = useState({ interests: [], length: '2 weeks', month: 'Not sure yet', pace: 'Balanced', comfort: 'Comfortable', group: 'Couple' })

  const applyPreset = (preset) => {
    setForm((f) => ({ ...f, ...preset }))
    document.getElementById('builder')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <main className="w-full bg-[#D5E8E2] pb-16 md:pb-24 flex flex-col items-center">
        <Hero />

        {/* Comment ça marche */}
        <section id="how" className={`${W} mt-20 md:mt-32 scroll-mt-6 grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-10 lg:gap-20`}>
          <div className="lg:sticky lg:top-6 self-start">
            <h2 className={H2}>From Idea To Itinerary</h2>
            <p className="mt-4 text-base md:text-lg text-slate-700 max-w-md">Four simple steps, with a real person on the other side.</p>
          </div>
          <ol className="flex flex-col">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-6 md:gap-10 border-t border-slate-900/15 py-8">
                <span className="text-5xl md:text-7xl font-semibold text-[#C49849] leading-none w-14 md:w-24 shrink-0">{i + 1}</span>
                <div>
                  <h3 className="text-xl md:text-3xl font-medium text-slate-900">{s.title}</h3>
                  <p className="mt-2 text-sm md:text-base text-slate-600 leading-relaxed">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Idées de départ */}
        <section className={`${W} mt-16 md:mt-28`}>
          <h2 className={H2}>Need A Starting Point?</h2>
          <p className="mt-3 text-base md:text-lg text-slate-700">Pick an idea and we fill in the first answers for you.</p>
          <ul className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            {ideas.map((it) => (
              <li key={it.title}>
                <button type="button" onClick={() => applyPreset(it.preset)} className="group relative block w-full aspect-[4/5] overflow-hidden rounded-[2rem] text-left text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-800">
                  <img src={it.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="text-2xl md:text-3xl font-medium">{it.title}</h3>
                    <p className="mt-2 text-sm text-white/80">{it.text}</p>
                    <span className="mt-4 inline-block text-sm font-medium text-[#e2c58d]">Start from this idea</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <Builder form={form} setForm={setForm} />

        {/* Contact direct */}
        <section className={`${W} mt-16 md:mt-28 relative overflow-hidden rounded-[2rem] md:rounded-[3rem] text-white min-h-[340px] flex items-center`}>
          <img src={Ramena} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-950/65" />
          <div className="relative p-8 md:p-16 max-w-3xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight">Prefer to talk it through?</h2>
            <p className="mt-4 text-sm md:text-lg text-white/85">Book a call or write to us. A travel expert replies within one working day.</p>
            <a href="/contact" className={`${BTN} ${GOLD} text-white mt-8`}>Contact a travel expert</a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default TailorMade