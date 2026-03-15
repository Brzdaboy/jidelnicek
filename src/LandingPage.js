import React from 'react';
import './LandingPage.css';

function LandingPage({ onStartApp }) {
  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-container">
      <header className="hero-section">
  <div className="hero-background">
    <div className="floating-card card-1">
      <div className="mini-menu">
        <div className="mini-title">Pondělí 17.11.</div>
        <div className="mini-item">🥣 Hovězí s abecedou</div>
        <div className="mini-item">🍖 Svíčková na smetaně</div>
      </div>
    </div>
    
    <div className="floating-card card-2">
      <div className="mini-menu">
        <div className="mini-title">Úterý 18.11.</div>
        <div className="mini-item">🥘 Gulášová polévka</div>
        <div className="mini-item">🍗 Kuřecí řízek</div>
      </div>
    </div>
    
    <div className="floating-card card-3">
      <div className="mini-menu">
        <div className="mini-title">Středa 19.11.</div>
        <div className="mini-item">🥕 Zeleninová polévka</div>
        <div className="mini-item">🍝 Těstoviny carbonara</div>
      </div>
    </div>
  </div>

  <div className="hero-content">
    <div className="hero-badge">✨ Nový nástroj pro plánování</div>
    <h1 className="hero-title">Týdenní jídelníček</h1>
    <p className="hero-subtitle">Profesionální nástroj pro plánování školních a firemních jídelníčků</p>
    <p className="hero-description">
      Vytvářejte týdenní jídelníčky snadno a rychle. Automatická detekce alergenů, export do PDF a přehledný tisk na A4.
    </p>
    <button className="cta-button" onClick={scrollToDemo}>
      <span>Vyzkoušet demo zdarma</span>
      <span className="cta-arrow">→</span>
    </button>
    <p className="hero-note">✓ Bez registrace  ✓ Všechny funkce  ✓ Zdarma</p>
  </div>
</header>

      <section className="features-section">
        <h2 className="section-title">Co aplikace umí</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3 className="feature-title">Týdenní plánování</h3>
            <p className="feature-description">
              Vytvářejte jídelníčky na celý týden (Po-Pá) s polévkou a třemi hlavními chody + dietní variantou.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3 className="feature-title">Automatické našeptávání</h3>
            <p className="feature-description">
              Systém si pamatuje dříve zadaná jídla a nabízí je při psání. Ušetříte spoustu času.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚠️</div>
            <h3 className="feature-title">Detekce alergenů</h3>
            <p className="feature-description">
              Automatické rozpoznávání alergenů v jídlech podle názvu. Můžete je ručně upravit a doplnit.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3 className="feature-title">Export do PDF</h3>
            <p className="feature-description">
              Optimalizovaný tisk na A4. Všechno se vejde na jednu stranu včetně příloh a kontaktů.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📆</div>
            <h3 className="feature-title">Kalendář</h3>
            <p className="feature-description">
              Přepínání mezi týdny pomocí kalendáře. Historie jídelníčků se automaticky ukládá.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3 className="feature-title">Přílohy a kontakty</h3>
            <p className="feature-description">
              Přidávejte přílohy s cenami a kontaktní údaje. Vše se zobrazí v PDF výstupu.
            </p>
          </div>
        </div>
      </section>

      <section className="demo-section" id="demo-section">
  <div className="demo-content">
    <h2 className="section-title">Začněte hned</h2>
    <p className="demo-description">
      Přihlaste se svými přihlašovacími údaji a začněte plánovat jídelníčky.
    </p>

    <button className="demo-button" onClick={onStartApp}>
      <span>Přihlásit se</span>
      <span className="button-arrow">→</span>
    </button>

    <div className="demo-features">
      <div className="demo-feature-item">
        <span className="demo-feature-icon">✓</span>
        Všechny funkce dostupné
      </div>
      <div className="demo-feature-item">
        <span className="demo-feature-icon">✓</span>
        Ukládání v prohlížeči
      </div>
      <div className="demo-feature-item">
        <span className="demo-feature-icon">✓</span>
        Bezpečné přihlášení
      </div>
    </div>
  </div>
</section>

      <footer className="footer">
        <p>&copy; 2024 Týdenní jídelníček. Všechna práva vyhrazena.</p>
      </footer>
    </div>
  );
}

export default LandingPage;