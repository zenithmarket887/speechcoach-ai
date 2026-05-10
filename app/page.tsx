'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

export default function LandingPage() {
  const { data: session } = useSession()
  const [letterOpen, setLetterOpen] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<'monthly' | 'annual' | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const primaryHref = session ? (session.user.role === 'orthophoniste' ? '/dashboard' : '/patient') : '/signup'
  const primaryLabel = session ? 'Reprendre l’entraînement' : 'Commencer gratuitement'

  const handleCheckout = async (plan: 'monthly' | 'annual') => {
    setCheckoutError(null)
    if (!session) {
      window.location.href = `/signup?next=/%23tarifs&plan=${plan}`
      return
    }
    setCheckoutLoading(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Impossible de démarrer le paiement.')
      window.location.href = data.url
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Erreur inconnue')
      setCheckoutLoading(null)
    }
  }

  return (
    <main className="landing">

      {/* ═══════════ NAV ═══════════ */}
      <nav className="lp-nav">
        <Link href="/" className="lp-nav-brand" aria-label="Parole+ AI — accueil">
          <Image src="/logo-final.png" alt="Parole+ AI" width={300} height={80} priority style={{ height: 80, width: 'auto' }} />
        </Link>
        <div className="lp-nav-links">
          <a href="#histoire">Mon histoire</a>
          <a href="#constat">Le constat</a>
          <a href="#fonctionnalites">L&apos;app</a>
          <a href="#tarifs">Tarifs</a>
        </div>
        <Link href={primaryHref} className="lp-nav-cta">{primaryLabel}</Link>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <header className="lp-hero">
        <div className="lp-hero-grid">
          <div>
            <div className="lp-hero-eyebrow">Pratique de la parole · au Québec</div>
            <h1 className="lp-hero-h1">
              Continuez à parler.<br />
              <span className="lp-hero-h1-accent">Chaque jour, chez vous.</span>
            </h1>
            <p className="lp-hero-tagline">
              «&nbsp;Quelques minutes par jour, c&apos;est ce qui m&apos;a permis de garder ma voix.&nbsp;»
            </p>
            <p className="lp-hero-lead">
              Une application d&apos;entraînement à la parole pour les adultes après un AVC,
              avec une maladie dégénérative (sclérose en plaques, Parkinson…), ou un
              traumatisme crânien. À pratiquer à votre rythme, sans déplacement, sans pression.
            </p>
            <div className="lp-hero-actions">
              <Link href={primaryHref} className="lp-btn lp-btn-yellow">{primaryLabel}</Link>
              <a href="#histoire" className="lp-btn lp-btn-ghost-light">Pourquoi j&apos;ai créé Parole+ →</a>
            </div>
          </div>

          {/* Mock app */}
          <div className="lp-hero-mock">
            <div className="lp-mock-top">
              <Image src="/logo-mark.png" alt="" width={28} height={28} style={{ borderRadius: 28 }} />
              <span className="lp-mock-xp">2 892 XP</span>
            </div>
            <h4 className="lp-mock-h4">Vos résultats</h4>
            <span className="lp-mock-pill">
              <span className="lp-mock-dot" />
              Doux — La promenade
            </span>
            <div className="lp-mock-score">
              <div className="lp-mock-ring">95</div>
              <div>
                <div className="lp-mock-grade">Excellent</div>
                <div className="lp-mock-sub">Score global</div>
              </div>
            </div>
            <div className="lp-mock-grid">
              {[
                ['95', 'Fluidité'],
                ['95', 'Hésit.'],
                ['100', 'Répét.'],
                ['100', 'Parasites'],
              ].map(([v, l]) => (
                <div key={l} className="lp-mock-cell">
                  <div className="lp-mock-cell-v">{v}</div>
                  <div className="lp-mock-cell-l">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════ HISTOIRE ═══════════ */}
      <section id="histoire" className="lp-section lp-bg-soft">
        <div className="lp-wrap">
          <div className="lp-eyebrow">Mon histoire</div>
          <h2 className="lp-h2">Parole+ est né d&apos;un manque que je vis chaque jour.</h2>

          <div className="lp-story-grid">
            <div className="lp-portrait">
              <Image
                src="/portrait-sebastien.jpg"
                alt="Portrait de Sébastien Girard, fondateur de Parole+"
                width={400}
                height={500}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
              />
              <div className="lp-portrait-caption">
                Fondateur
                <strong>Parole+</strong>
              </div>
            </div>
            <div className="lp-story-text">
              <p>Je vis avec la sclérose en plaques depuis mes 17 ans. Aujourd&apos;hui, à 45 ans,
              je suis quadriplégique — et la maladie a touché ce qu&apos;il y a de plus humain :
              ma capacité à parler.</p>

              <p>Au Québec, après la phase de réadaptation, on se retrouve seul. Une séance d&apos;orthophonie
              par semaine en clinique externe, des frais de transport, peu d&apos;outils pour pratiquer à la
              maison. Et pourtant : <strong>quelques minutes par jour, c&apos;est ce qui fait la différence
              entre garder sa voix et la perdre.</strong></p>

              <blockquote className="lp-quote">«&nbsp;Si l&apos;outil que je cherchais n&apos;existait pas, j&apos;allais le construire.&nbsp;»</blockquote>

              <p>J&apos;ai imaginé <strong>Parole+</strong> d&apos;abord pour moi — pour pratiquer chez moi,
              à mon rythme, sans pression. Puis j&apos;ai compris que mon meilleur ami avec un traumatisme
              crânien en avait autant besoin. Et avec lui, toutes les personnes après un AVC, ou atteintes
              d&apos;une maladie dégénérative comme la mienne. Sans jugement. Sans condescendance. Conçu
              pour des adultes.</p>

              <button
                onClick={() => setLetterOpen(o => !o)}
                aria-expanded={letterOpen}
                className="lp-letter-toggle"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {letterOpen ? 'Replier la lettre' : 'Lire ma lettre'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ transform: letterOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 250ms ease' }}>
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {letterOpen && (
            <article className="lp-letter">
              <div className="lp-letter-eyebrow">Une lettre de moi à vous</div>
              <h3 className="lp-letter-h3">Mon histoire.</h3>

              <div className="lp-letter-body">
                <p>J&apos;ai 17 ans quand la sclérose en plaques entre dans ma vie.</p>
                <p>Au début, c&apos;est discret. Puis, tranquillement, quelque chose change. Les mots deviennent plus difficiles à trouver. Les phrases demandent plus d&apos;effort. Comme si une partie de moi s&apos;éloignait, un peu plus chaque jour.</p>
                <p>Les années passent.</p>
                <p>Aujourd&apos;hui, j&apos;ai 45 ans. Je suis quadriplégique. Et la maladie a continué son travail, en silence, jusqu&apos;à toucher ce qu&apos;il y a de plus humain : ma capacité à parler.</p>
                <p>Communiquer. Exprimer. Être compris.</p>
                <p>Pendant un moment, j&apos;ai cru que c&apos;était la fin de ça.</p>

                <p className="lp-letter-break">Puis, cette année, quelque chose a changé.</p>
                <p>Je me suis équipé. J&apos;ai découvert les nouvelles technologies adaptées. J&apos;ai recommencé à apprendre. À tester. À pratiquer.</p>
                <p>Et là… j&apos;ai vu quelque chose que je n&apos;avais jamais vu avant :</p>
                <p className="lp-letter-emphase">Une opportunité.</p>
                <p>Pas juste pour moi.</p>
                <p>Pour tous ceux qui vivent la même réalité.</p>

                <p className="lp-letter-break">J&apos;ai commencé à créer une application. Pas parce que ça existait déjà. Justement parce que ça n&apos;existait pas.</p>
                <p>Une application pour réapprendre à parler. À son rythme. Avec dignité. Avec des outils adaptés à notre réalité.</p>
                <p>Au début, c&apos;était pour moi.</p>
                <p>Mais très vite, quelque chose d&apos;inattendu s&apos;est produit.</p>
                <p>Mon état a évolué… dans l&apos;autre sens.</p>
                <p>Là où on me disait qu&apos;il me restait quelques années de parole, j&apos;ai recommencé à devenir fonctionnel.</p>
                <p>À m&apos;exprimer.</p>
                <p>À retrouver une partie de moi que je pensais perdue.</p>

                <p className="lp-letter-break">C&apos;est là que j&apos;ai compris.</p>
                <p>Ce projet ne m&apos;appartient plus.</p>
                <p>Il doit aller plus loin.</p>

                <p className="lp-letter-break">Parce qu&apos;au fond, ce n&apos;est pas juste une application.</p>
                <p className="lp-letter-emphase">C&apos;est une deuxième chance.</p>
                <p>C&apos;est un outil pour redonner une voix à ceux qui la perdent.</p>
                <p>C&apos;est une façon de dire : «&nbsp;Tu n&apos;es pas seul. Et il y a encore des solutions.&nbsp;»</p>

                <p className="lp-letter-break">Je veux que cette application voyage.</p>
                <p>Qu&apos;elle entre dans les familles. Qu&apos;elle soutienne les proches. Qu&apos;elle redonne espoir.</p>
                <p>Parce que derrière la technologie… il y a quelque chose de beaucoup plus grand.</p>
                <p>Il y a l&apos;humain.</p>
                <p>Il y a l&apos;entraide.</p>
                <p>Et il y a cette conviction profonde que, même dans les moments les plus difficiles, on peut encore se transmettre quelque chose d&apos;essentiel :</p>
                <p className="lp-letter-emphase">Un peu de force. Un peu de lumière. Et beaucoup d&apos;amour.</p>

                <p className="lp-letter-signature">— Sébastien Girard, fondateur de Parole+</p>
              </div>
            </article>
          )}
        </div>
      </section>

      {/* ═══════════ CONSTAT ═══════════ */}
      <section id="constat" className="lp-section">
        <div className="lp-wrap">
          <div className="lp-eyebrow">Le constat</div>
          <h2 className="lp-h2">Au Québec, une fois la réadaptation terminée, vous êtes seul.</h2>
          <p className="lp-lead">
            Une séance d&apos;orthophonie par semaine, en clinique externe, avec des frais
            de transport et peu de matériel à utiliser à la maison. Pour les maladies
            dégénératives, l&apos;accès devient encore plus rare avec le temps.
          </p>

          <div className="lp-stats">
            <div className="lp-stat">
              <div className="lp-stat-num">~80&nbsp;%</div>
              <div className="lp-stat-lab">des personnes en réadaptation à long terme ne peuvent plus s&apos;offrir de l&apos;orthophonie en privé une fois les assurances épuisées.</div>
            </div>
            <div className="lp-stat">
              <div className="lp-stat-num">1 / sem.</div>
              <div className="lp-stat-lab">la fréquence typique des rendez-vous en clinique externe — alors que la pratique idéale est <strong>quotidienne</strong>.</div>
            </div>
            <div className="lp-stat">
              <div className="lp-stat-num">9,99 $</div>
              <div className="lp-stat-lab">par mois pour pratiquer chaque jour. <strong>Moins de 3 cafés.</strong> Sans transport, sans liste d&apos;attente.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FONCTIONNALITÉS ═══════════ */}
      <section id="fonctionnalites" className="lp-section lp-bg-soft">
        <div className="lp-wrap">
          <div className="lp-eyebrow">Comment ça marche</div>
          <h2 className="lp-h2">Trois étapes, à votre rythme.</h2>
          <p className="lp-lead">Parole+ guide votre entraînement sans jamais vous brusquer. Vous choisissez, vous lisez, vous progressez.</p>

          <div className="lp-feats">
            <div className="lp-feat">
              <div className="lp-feat-ico" style={{ background: 'var(--p-green-bg)' }}>
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                  <path d="M6 8h20M6 16h20M6 24h14" stroke="var(--p-green)" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="28" cy="24" r="3" fill="var(--p-green)" />
                </svg>
              </div>
              <h3 className="lp-feat-h3">1 — Choisissez un texte</h3>
              <p className="lp-feat-p">Cinq niveaux de difficulté, des thèmes concrets (la promenade, la maison, la nature). Synthèse vocale sur tous les textes pour vous guider.</p>
            </div>

            <div className="lp-feat">
              <div className="lp-feat-ico" style={{ background: 'var(--p-blue-bg)' }}>
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                  <rect x="12" y="4" width="8" height="14" rx="4" fill="var(--p-blue)" />
                  <path d="M8 16a8 8 0 0 0 16 0" stroke="var(--p-blue)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <line x1="16" y1="24" x2="16" y2="28" stroke="var(--p-blue)" strokeWidth="2.5" />
                </svg>
              </div>
              <h3 className="lp-feat-h3">2 — Lisez à voix haute</h3>
              <p className="lp-feat-p">Un grand bouton, un timer doux, une onde visuelle. Aucune pression, aucun chronomètre menaçant. Recommencez autant de fois que vous voulez.</p>
            </div>

            <div className="lp-feat">
              <div className="lp-feat-ico" style={{ background: 'var(--p-amber-bg)' }}>
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="11" stroke="var(--p-amber)" strokeWidth="3" fill="none" />
                  <path d="M11 16l4 4 7-8" stroke="var(--p-amber)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <h3 className="lp-feat-h3">3 — Recevez votre analyse</h3>
              <p className="lp-feat-p">Score de fluidité, hésitations, mots parasites. Analyse expressive (intonation, émotions). Trois recommandations concrètes — jamais plus.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ POUR QUI ═══════════ */}
      <section className="lp-section">
        <div className="lp-wrap">
          <div className="lp-eyebrow">Pour qui</div>
          <h2 className="lp-h2">Conçu pour les adultes que le système laisse seuls.</h2>
          <p className="lp-lead">Si vous vous reconnaissez dans une de ces situations, Parole+ est fait pour vous — ou pour un proche.</p>

          <div className="lp-audience-grid">
            {[
              { emoji: '🧠', t: 'Après un AVC', d: 'Vous êtes sorti de réadaptation aiguë et continuez la rééducation à domicile.' },
              { emoji: '🌱', t: 'Maladie dégénérative', d: 'Sclérose en plaques, Parkinson, SLA — pratiquer chaque jour permet de préserver votre autonomie.' },
              { emoji: '💪', t: 'Traumatisme crânien', d: 'Vous avez fini votre réadaptation et n&apos;avez plus de service mais un grand besoin de pratique.' },
              { emoji: '👨‍👩‍👧', t: 'Un proche concerné', d: 'Vous accompagnez un parent, un conjoint, un ami — Parole+ devient un outil partagé à la maison.' },
            ].map(item => (
              <div key={item.t} className="lp-audience-card">
                <div className="lp-audience-emoji">{item.emoji}</div>
                <h3 className="lp-audience-t">{item.t}</h3>
                <p className="lp-audience-d" dangerouslySetInnerHTML={{ __html: item.d }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TARIFS ═══════════ */}
      <section id="tarifs" className="lp-section lp-bg-soft">
        <div className="lp-wrap">
          <div className="lp-eyebrow">Tarifs</div>
          <h2 className="lp-h2">Moins qu&apos;une consultation. Plus qu&apos;un service.</h2>
          <p className="lp-lead">
            Choisissez ce qui vous convient. Pas d&apos;engagement. Annulable à tout moment.
            Tous les prix sont en dollars canadiens.
          </p>

          <div className="lp-pricing">
            {/* Gratuit */}
            <div className="lp-plan">
              <div className="lp-plan-name">Gratuit</div>
              <div className="lp-plan-price">
                <span className="lp-plan-amt">0&nbsp;$</span>
                <span className="lp-plan-per">pour toujours</span>
              </div>
              <p className="lp-plan-tag">Pour découvrir et garder une pratique quotidienne minimale.</p>
              <ul className="lp-plan-list">
                <li>Pratique <strong>illimitée</strong> — chaque jour si vous voulez</li>
                <li>Niveaux <strong>doux et régulier</strong></li>
                <li>Analyse de fluidité et de mots parasites</li>
                <li>Streak quotidien et badges</li>
                <li>Historique des 7 derniers jours</li>
              </ul>
              <Link href={primaryHref} className="lp-btn lp-btn-ghost lp-plan-cta">Commencer gratuitement</Link>
            </div>

            {/* Mensuel */}
            <div className="lp-plan">
              <div className="lp-plan-name">Mensuel</div>
              <div className="lp-plan-price">
                <span className="lp-plan-amt">9,99&nbsp;$</span>
                <span className="lp-plan-per">/&nbsp;mois CAD</span>
              </div>
              <p className="lp-plan-tag">Pour essayer toutes les fonctionnalités sans s&apos;engager.</p>
              <ul className="lp-plan-list">
                <li>Tout du plan Gratuit, plus :</li>
                <li>Tous les niveaux <strong>(Soutenu, Exigeant, Maîtrise)</strong></li>
                <li><strong>Analyse expressive</strong> (intonation, émotions)</li>
                <li>Bibliothèque complète d&apos;exercices</li>
                <li>Historique <strong>illimité</strong> + graphiques de progression</li>
                <li>Annulable à tout moment</li>
              </ul>
              <button
                type="button"
                onClick={() => handleCheckout('monthly')}
                disabled={checkoutLoading !== null}
                className="lp-btn lp-btn-primary lp-plan-cta"
              >
                {checkoutLoading === 'monthly' ? 'Redirection…' : 'Choisir le mensuel'}
              </button>
            </div>

            {/* Annuel - mis en avant */}
            <div className="lp-plan lp-plan-featured">
              <div className="lp-plan-badge">Recommandé · 5 mois offerts</div>
              <div className="lp-plan-name">Annuel</div>
              <div className="lp-plan-price">
                <span className="lp-plan-amt">69&nbsp;$</span>
                <span className="lp-plan-per">/&nbsp;an CAD</span>
              </div>
              <p className="lp-plan-equiv">≈ 5,75&nbsp;$/mois — soit 2 cafés par mois</p>
              <p className="lp-plan-tag">Payez 7 mois, profitez-en 12. La meilleure offre.</p>
              <ul className="lp-plan-list">
                <li>Pratique <strong>illimitée</strong> — chaque jour</li>
                <li>Tous les niveaux <strong>(Soutenu, Exigeant, Maîtrise)</strong></li>
                <li><strong>Analyse expressive</strong> (intonation, émotions)</li>
                <li>Bibliothèque complète d&apos;exercices</li>
                <li>Historique <strong>illimité</strong> + graphiques de progression</li>
                <li>Annulable à tout moment</li>
                <li><strong>5 mois offerts</strong> par rapport au paiement mensuel</li>
                <li><strong>50,88&nbsp;$ d&apos;économie</strong> sur l&apos;année</li>
                <li><strong>Soutien direct</strong> du projet — vous l&apos;aidez à grandir</li>
                <li>Accès prioritaire aux nouvelles fonctionnalités</li>
              </ul>
              <button
                type="button"
                onClick={() => handleCheckout('annual')}
                disabled={checkoutLoading !== null}
                className="lp-btn lp-btn-yellow lp-plan-cta"
              >
                {checkoutLoading === 'annual' ? 'Redirection…' : 'Choisir l’annuel'}
              </button>
            </div>
          </div>

          {checkoutError && (
            <div style={{
              maxWidth: 520, margin: '24px auto 0',
              background: '#F7E1DE', border: '1.5px solid #A8261D',
              borderRadius: 12, padding: '12px 16px',
              color: '#A8261D', fontSize: 14, lineHeight: 1.5,
            }}>
              {checkoutError}
            </div>
          )}

        </div>
      </section>

      {/* ═══════════ CTA FINAL ═══════════ */}
      <section className="lp-cta-final">
        <div className="lp-wrap">
          <h2 className="lp-cta-h2">Vous n&apos;êtes pas seul.</h2>
          <p className="lp-cta-p">
            Quelques minutes par jour, à votre rythme, pour garder ou retrouver votre voix.
            Commencez gratuitement, dès maintenant.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link href={primaryHref} className="lp-btn lp-btn-primary">{primaryLabel}</Link>
            <Link href="/login" className="lp-btn lp-btn-ghost">J&apos;ai déjà un compte</Link>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-grid">
          <div>
            <Image src="/logo-final.png" alt="Parole+" width={150} height={48} style={{ height: 48, width: 'auto', background: '#FFF', padding: '8px 14px', borderRadius: 12 }} />
            <p className="lp-footer-blurb">Outil d&apos;entraînement à la parole pour adultes en réapprentissage du langage. Une initiative personnelle, indépendante, basée au Québec.</p>
          </div>
          <div>
            <h4>Le projet</h4>
            <a href="#histoire">Mon histoire</a>
            <a href="#constat">Le constat</a>
            <a href="#fonctionnalites">L&apos;app</a>
            <a href="#tarifs">Tarifs</a>
          </div>
          <div>
            <h4>Compte</h4>
            <Link href="/login">Se connecter</Link>
            <Link href={primaryHref}>Commencer</Link>
          </div>
          <div>
            <h4>Contact</h4>
            <a href="mailto:sebastien.girard@paroleplus.ca">sebastien.girard@paroleplus.ca</a>
          </div>
        </div>
        <div className="lp-footer-meta">© 2026 Parole+ · Fait à la main, au Québec</div>
      </footer>

      <style jsx global>{`
        body { background: #FFFFFF; }
        .landing { min-height: 100vh; background: #FFFFFF; color: var(--p-ink); }

        /* ═══ NAV ═══ */
        .lp-nav {
          position: sticky; top: 0; z-index: 50;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--p-border);
          padding: 14px 40px;
          display: flex; align-items: center; gap: 14px;
        }
        .lp-nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .lp-nav-links { display: flex; gap: 28px; margin-left: auto; }
        .lp-nav-links :global(a) { color: var(--p-ink-soft); text-decoration: none; font-weight: 600; font-size: 15px; }
        .lp-nav-links :global(a:hover) { color: var(--p-blue); }
        .lp-nav-cta {
          background: var(--p-blue); color: #FFF; text-decoration: none;
          padding: 10px 18px; border-radius: 12px;
          font-weight: 700; font-size: 15px; border: none;
          box-shadow: 0 3px 0 var(--p-blue-dark);
        }
        @media (max-width: 720px) {
          .lp-nav { padding: 12px 18px; }
          .lp-nav-links { display: none; }
        }

        /* ═══ COMMON ═══ */
        .lp-section { padding: 96px 40px; }
        .lp-bg-soft { background: var(--p-surface-dim); }
        .lp-wrap { max-width: 1140px; margin: 0 auto; }
        @media (max-width: 720px) { .lp-section { padding: 64px 22px; } }
        .lp-eyebrow {
          font-family: var(--font-mono), monospace;
          font-size: 12px; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--p-blue);
          font-weight: 700;
        }
        .lp-h2 {
          font-family: var(--font-fraunces), serif; font-weight: 700;
          font-size: 48px; line-height: 1.1;
          margin: 12px 0 18px; letter-spacing: -0.6px;
          max-width: 760px;
        }
        .lp-lead {
          font-size: 19px; line-height: 1.6;
          color: var(--p-ink-soft); max-width: 720px;
          margin: 0 0 56px;
        }
        @media (max-width: 720px) {
          .lp-h2 { font-size: 32px; }
          .lp-lead { font-size: 17px; }
        }

        /* ═══ BUTTONS ═══ */
        .lp-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          min-height: 56px; padding: 0 26px; border-radius: 14px;
          font-weight: 700; font-size: 17px; text-decoration: none;
          border: none; cursor: pointer;
          transition: transform 0.08s ease, box-shadow 0.08s ease;
        }
        .lp-btn-yellow { background: #FFD86B; color: var(--p-blue-dark); box-shadow: 0 4px 0 #C9A332; }
        .lp-btn-yellow:hover { background: #FFE090; }
        .lp-btn-ghost-light { background: transparent; color: #FFF; border: 2px solid rgba(255,255,255,0.5); }
        .lp-btn-ghost-light:hover { background: rgba(255,255,255,0.08); }
        .lp-btn-primary { background: var(--p-blue); color: #FFF; box-shadow: 0 4px 0 var(--p-blue-dark); }
        .lp-btn-primary:hover { background: var(--p-blue-dark); }
        .lp-btn-ghost { background: var(--p-surface); color: var(--p-ink); border: 2px solid var(--p-border); }
        .lp-btn-ghost:hover { background: var(--p-surface-soft); }

        /* ═══ HERO ═══ */
        .lp-hero {
          background: linear-gradient(160deg, #103E85 0%, #1E5BB8 60%, #2F75D8 100%);
          color: #FFF;
          padding: 140px 40px 120px;
          position: relative; overflow: hidden;
        }
        .lp-hero::before {
          content: ""; position: absolute; right: -120px; top: -120px;
          width: 520px; height: 520px; border-radius: 520px;
          background: radial-gradient(circle, rgba(255,255,255,0.18), transparent 65%);
        }
        .lp-hero::after {
          content: ""; position: absolute; left: -80px; bottom: -180px;
          width: 380px; height: 380px; border-radius: 380px;
          background: radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%);
        }
        .lp-hero-grid {
          max-width: 1140px; margin: 0 auto;
          display: grid; grid-template-columns: 1.1fr 1fr; gap: 80px;
          align-items: center; position: relative; z-index: 1;
        }
        .lp-hero-eyebrow {
          font-family: var(--font-mono), monospace;
          font-size: 12px; letter-spacing: 0.18em;
          text-transform: uppercase; opacity: 0.85;
          margin-bottom: 18px; font-weight: 700;
        }
        .lp-hero-h1 {
          font-family: var(--font-fraunces), serif; font-weight: 700;
          font-size: 68px; line-height: 1.05;
          margin: 0 0 22px; letter-spacing: -1.5px;
          color: #FFF;
        }
        .lp-hero-h1-accent { color: #FFD86B; }
        .lp-hero-tagline {
          font-family: var(--font-fraunces), serif; font-style: italic;
          font-size: 26px; line-height: 1.4;
          opacity: 0.95; margin: 0 0 32px;
        }
        .lp-hero-lead {
          font-size: 18px; line-height: 1.65;
          opacity: 0.92; max-width: 540px; margin: 0 0 36px;
        }
        .lp-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }

        .lp-hero-mock {
          background: #FFF; border-radius: 24px;
          box-shadow: 0 30px 80px rgba(0,0,0,0.35);
          padding: 22px 22px 18px;
          transform: rotate(2deg);
        }
        .lp-mock-top {
          display: flex; align-items: center; gap: 8px;
          padding-bottom: 10px; border-bottom: 1px solid var(--p-border);
        }
        .lp-mock-xp {
          margin-left: auto; font-family: var(--font-mono), monospace;
          font-size: 11px; color: var(--p-ink-mute);
        }
        .lp-mock-h4 {
          font-family: var(--font-fraunces), serif; font-weight: 700;
          font-size: 20px; margin: 4px 0 10px; color: var(--p-ink);
        }
        .lp-mock-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 10px; border-radius: 999px;
          font-size: 12px; font-weight: 700;
          background: var(--p-green-bg); color: var(--p-green);
        }
        .lp-mock-dot { width: 6px; height: 6px; border-radius: 6px; background: #2BA265; }
        .lp-mock-score {
          display: flex; align-items: center; gap: 18px;
          padding: 18px 0;
        }
        .lp-mock-ring {
          width: 64px; height: 64px; border-radius: 64px;
          border: 6px solid var(--p-green);
          display: grid; place-items: center;
          font-family: var(--font-fraunces), serif; font-weight: 700; font-size: 22px;
          color: var(--p-ink);
        }
        .lp-mock-grade {
          font-family: var(--font-fraunces), serif; font-weight: 700;
          font-size: 18px; color: var(--p-ink);
        }
        .lp-mock-sub { font-size: 13px; color: var(--p-ink-mute); }
        .lp-mock-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
          padding: 10px 0; border-top: 1px solid var(--p-border);
        }
        .lp-mock-cell { text-align: center; }
        .lp-mock-cell-v {
          font-family: var(--font-fraunces), serif; font-weight: 700;
          font-size: 18px; color: var(--p-green);
        }
        .lp-mock-cell-l { font-size: 11px; color: var(--p-ink-mute); }

        @media (max-width: 980px) {
          .lp-hero { padding: 80px 24px 80px; }
          .lp-hero-grid { grid-template-columns: 1fr; gap: 48px; }
          .lp-hero-h1 { font-size: 44px; }
          .lp-hero-tagline { font-size: 21px; }
        }

        /* ═══ HISTOIRE ═══ */
        .lp-story-grid {
          display: grid; grid-template-columns: 1fr 1.4fr; gap: 64px;
          align-items: start;
        }
        .lp-portrait {
          aspect-ratio: 4/5; border-radius: 24px;
          border: 2px solid var(--p-border);
          overflow: hidden; position: relative;
          box-shadow: 0 30px 60px rgba(14,27,44,0.18);
        }
        .lp-portrait-caption {
          position: absolute; left: 16px; bottom: 16px;
          background: rgba(14, 27, 44, 0.85);
          color: #FFF; backdrop-filter: blur(8px);
          padding: 10px 14px; border-radius: 10px;
          font-family: var(--font-mono), monospace;
          font-size: 11px; letter-spacing: 0.16em;
          text-transform: uppercase; font-weight: 700;
        }
        .lp-portrait-caption strong {
          display: block; font-family: var(--font-fraunces), serif;
          font-size: 16px; letter-spacing: 0; text-transform: none;
          font-weight: 700; margin-top: 2px;
        }
        .lp-story-text :global(p) {
          font-size: 18px; line-height: 1.75;
          color: var(--p-ink); margin: 0 0 18px;
        }
        .lp-quote {
          font-family: var(--font-fraunces), serif;
          font-style: italic; font-weight: 500;
          font-size: 28px; line-height: 1.4;
          color: var(--p-ink);
          border-left: 4px solid var(--p-blue);
          padding: 8px 0 8px 28px; margin: 32px 0;
        }
        .lp-letter-toggle {
          background: var(--p-blue-bg); color: var(--p-blue-dark);
          border: 2px solid var(--p-blue);
          border-radius: 14px;
          padding: 14px 22px;
          font-weight: 700; font-size: 16px;
          display: inline-flex; align-items: center; gap: 10px;
          cursor: pointer; min-height: 52px;
          transition: background 0.1s ease;
        }
        .lp-letter-toggle:hover { background: #D4E3F8; }
        @media (max-width: 980px) { .lp-story-grid { grid-template-columns: 1fr; gap: 32px; } }

        /* ═══ LETTRE ═══ */
        .lp-letter {
          margin-top: 56px;
          background: #FFFEFA;
          background-image: linear-gradient(transparent calc(36px - 1px), #E5DFCC 36px, transparent 37px);
          background-size: 100% 36px;
          background-position: 0 92px;
          border: 1.5px solid #E0D9C2;
          border-radius: 18px;
          padding: 56px 64px 64px;
          box-shadow: 0 30px 60px rgba(14,27,44,0.10);
          max-width: 820px; margin-left: auto; margin-right: auto;
          position: relative;
        }
        .lp-letter::before {
          content: ""; position: absolute;
          left: 64px; right: 64px; top: 0;
          height: 4px;
          background: linear-gradient(90deg, transparent, var(--p-blue) 30%, var(--p-blue) 70%, transparent);
        }
        .lp-letter-eyebrow {
          font-family: var(--font-mono), monospace;
          font-size: 11px; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--p-blue);
          font-weight: 700; margin-bottom: 8px;
        }
        .lp-letter-h3 {
          font-family: var(--font-fraunces), serif; font-style: italic;
          font-weight: 500; font-size: 44px; line-height: 1.1;
          letter-spacing: -0.6px; margin: 0 0 36px;
          color: var(--p-ink);
        }
        .lp-letter-body :global(p) {
          font-family: var(--font-fraunces), serif; font-weight: 400;
          font-size: 19px; line-height: 36px;
          color: var(--p-ink); margin: 0 0 24px;
        }
        .lp-letter-break { margin-top: 36px !important; }
        .lp-letter-emphase {
          font-style: italic !important; font-weight: 500 !important;
          font-size: 24px !important;
          color: var(--p-blue-dark) !important;
        }
        .lp-letter-signature {
          font-family: var(--font-fraunces), serif !important;
          font-style: italic !important;
          font-size: 22px !important; line-height: 36px !important;
          color: var(--p-blue-dark) !important;
          margin-top: 36px !important;
        }
        @media (max-width: 720px) {
          .lp-letter { padding: 40px 28px; background-position: 0 78px; }
          .lp-letter-h3 { font-size: 32px; }
          .lp-letter-body :global(p) { font-size: 17px; line-height: 32px; }
        }

        /* ═══ STATS ═══ */
        .lp-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .lp-stat {
          background: #FFF; border: 2px solid var(--p-border);
          border-radius: 18px; padding: 32px 28px;
        }
        .lp-stat-num {
          font-family: var(--font-fraunces), serif; font-weight: 700;
          font-size: 56px; line-height: 1; color: var(--p-blue);
          letter-spacing: -1px; margin-bottom: 12px;
        }
        .lp-stat-lab {
          font-size: 16px; color: var(--p-ink-soft); line-height: 1.5;
        }
        @media (max-width: 720px) { .lp-stats { grid-template-columns: 1fr; } }

        /* ═══ FEATS ═══ */
        .lp-feats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .lp-feat {
          background: #FFF; border: 1.5px solid var(--p-border);
          border-radius: 18px; padding: 28px;
        }
        .lp-feat-ico {
          width: 56px; height: 56px; border-radius: 14px;
          display: grid; place-items: center; margin-bottom: 18px;
        }
        .lp-feat-h3 {
          font-family: var(--font-fraunces), serif; font-weight: 700;
          font-size: 22px; line-height: 1.3;
          margin: 0 0 10px; color: var(--p-ink);
        }
        .lp-feat-p {
          margin: 0; font-size: 15px; line-height: 1.6;
          color: var(--p-ink-soft);
        }
        @media (max-width: 720px) { .lp-feats { grid-template-columns: 1fr; } }

        /* ═══ AUDIENCE ═══ */
        .lp-audience-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;
        }
        .lp-audience-card {
          background: #FFF; border: 1.5px solid var(--p-border);
          border-radius: 18px; padding: 28px 24px;
        }
        .lp-audience-emoji { font-size: 36px; margin-bottom: 14px; }
        .lp-audience-t {
          font-family: var(--font-fraunces), serif; font-weight: 700;
          font-size: 19px; margin: 0 0 8px; color: var(--p-ink);
        }
        .lp-audience-d { margin: 0; font-size: 14px; line-height: 1.55; color: var(--p-ink-soft); }
        @media (max-width: 980px) { .lp-audience-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 560px) { .lp-audience-grid { grid-template-columns: 1fr; } }

        /* ═══ PRICING ═══ */
        .lp-pricing {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
          margin-top: 8px;
        }
        .lp-plan {
          background: #FFF; border: 2px solid var(--p-border);
          border-radius: 20px; padding: 32px 28px;
          display: flex; flex-direction: column;
          position: relative;
        }
        .lp-plan-featured {
          border-color: var(--p-blue);
          box-shadow: 0 16px 40px rgba(30,91,184,0.18);
          transform: translateY(-8px);
        }
        .lp-plan-badge {
          position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
          background: #FFD86B; color: var(--p-blue-dark);
          padding: 6px 14px; border-radius: 999px;
          font-size: 12px; font-weight: 700;
          font-family: var(--font-mono), monospace;
          letter-spacing: 0.05em; text-transform: uppercase;
          white-space: nowrap;
        }
        .lp-plan-name {
          font-family: var(--font-mono), monospace;
          font-size: 12px; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--p-blue);
          font-weight: 700; margin-bottom: 12px;
        }
        .lp-plan-price {
          display: flex; align-items: baseline; gap: 8px;
          margin-bottom: 8px;
        }
        .lp-plan-amt {
          font-family: var(--font-fraunces), serif; font-weight: 700;
          font-size: 48px; color: var(--p-ink);
          letter-spacing: -1px; line-height: 1;
        }
        .lp-plan-per { font-size: 14px; color: var(--p-ink-mute); }
        .lp-plan-equiv {
          font-size: 13px; color: var(--p-blue);
          font-weight: 600; margin: 0 0 12px;
        }
        .lp-plan-tag {
          font-size: 14px; color: var(--p-ink-soft);
          margin: 0 0 22px; line-height: 1.5;
        }
        .lp-plan-list {
          list-style: none; padding: 0; margin: 0 0 28px;
          display: flex; flex-direction: column; gap: 10px;
          flex: 1;
        }
        .lp-plan-list li {
          font-size: 14px; line-height: 1.5; color: var(--p-ink);
          padding-left: 22px; position: relative;
        }
        .lp-plan-list li::before {
          content: "✓"; position: absolute; left: 0; top: 0;
          width: 16px; height: 16px; border-radius: 16px;
          background: var(--p-green); color: #FFF;
          display: grid; place-items: center;
          font-size: 10px; font-weight: 700;
        }
        .lp-plan-cta { width: 100%; }
        .lp-pricing-note {
          margin-top: 32px; text-align: center;
          font-size: 15px; color: var(--p-ink-soft);
          font-style: italic;
        }
        .lp-pricing-note :global(a) { color: var(--p-blue); font-weight: 600; }
        @media (max-width: 980px) {
          .lp-pricing { grid-template-columns: 1fr; }
          .lp-plan-featured { transform: none; }
        }

        /* ═══ PRO À VENIR ═══ */
        .lp-pro-card {
          background: var(--p-blue-dark); color: #FFF;
          border-radius: 24px; padding: 48px 56px;
          max-width: 760px; margin: 0 auto;
          text-align: center;
        }
        .lp-pro-tag {
          display: inline-flex; padding: 6px 14px; border-radius: 999px;
          background: rgba(255,255,255,0.15); color: #FFD86B;
          font-family: var(--font-mono), monospace;
          font-size: 12px; letter-spacing: 0.16em;
          text-transform: uppercase; font-weight: 700;
          margin-bottom: 18px;
        }
        .lp-pro-h3 {
          font-family: var(--font-fraunces), serif; font-weight: 700;
          font-size: 32px; line-height: 1.2;
          margin: 0 0 14px; color: #FFF;
        }
        .lp-pro-p {
          font-size: 17px; line-height: 1.65; opacity: 0.92;
          margin: 0 auto 24px; max-width: 560px;
        }
        @media (max-width: 720px) {
          .lp-pro-card { padding: 36px 28px; }
          .lp-pro-h3 { font-size: 24px; }
        }

        /* ═══ CTA FINAL ═══ */
        .lp-cta-final {
          background: linear-gradient(160deg, #FFFFFF 0%, var(--p-blue-bg) 100%);
          border-top: 1px solid var(--p-border);
          border-bottom: 1px solid var(--p-border);
          text-align: center;
          padding: 96px 40px;
        }
        .lp-cta-h2 {
          font-family: var(--font-fraunces), serif; font-weight: 700;
          font-size: 48px; line-height: 1.1;
          letter-spacing: -0.5px; margin: 0 0 16px;
          color: var(--p-ink);
        }
        .lp-cta-p {
          font-size: 19px; color: var(--p-ink-soft);
          max-width: 620px; margin: 0 auto 36px;
        }
        @media (max-width: 720px) {
          .lp-cta-final { padding: 64px 22px; }
          .lp-cta-h2 { font-size: 32px; }
        }

        /* ═══ FOOTER ═══ */
        .lp-footer {
          background: var(--p-ink); color: #C7D1E0;
          padding: 56px 40px 32px;
        }
        .lp-footer-grid {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px;
        }
        .lp-footer-blurb {
          font-size: 15px; opacity: 0.8; margin-top: 14px; max-width: 320px;
          line-height: 1.6;
        }
        .lp-footer h4 {
          font-family: var(--font-mono), monospace;
          font-size: 11px; letter-spacing: 0.18em;
          text-transform: uppercase; opacity: 0.7;
          font-weight: 700; margin: 0 0 14px;
          color: #C7D1E0;
        }
        .lp-footer :global(a) {
          color: #C7D1E0; text-decoration: none;
          display: block; padding: 4px 0;
          font-size: 15px;
        }
        .lp-footer :global(a:hover) { color: #FFF; }
        .lp-footer-meta {
          margin-top: 40px; padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.1);
          font-family: var(--font-mono), monospace;
          font-size: 12px; letter-spacing: 0.12em;
          text-transform: uppercase; opacity: 0.5;
          text-align: center;
        }
        @media (max-width: 720px) {
          .lp-footer-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </main>
  )
}
