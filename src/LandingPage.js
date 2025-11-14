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
        <div className="hero-content">
          <h1 className="hero-title">Týdenní jídelníček</h1>
          <p className="hero-subtitle">Profesionální nástroj pro plánování školních a firemních jídelníčků</p>
          <p className="hero-description">
            Vytvářejte týdenní jídelníčky snadno a rychle.<br />
            Automatická detekce alergenů, export do PDF a přehledný tisk na A4.
          </p>
          <button className="cta-button" onClick={scrollToDemo}>
            Vyzkoušet demo zdarma
          </button>
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
          <h2 className="section-title">Vyzkoušejte demo verzi</h2>
          <p className="demo-description">
            Přihlaste se pomocí demo účtu a vyzkoušejte všechny funkce aplikace zdarma.
          </p>
          
          <div className="demo-credentials">
            <div className="credential-item">
              <span className="credential-label">Uživatelské jméno:</span>
              <span className="credential-value">demo</span>
            </div>
            <div className="credential-item">
              <span className="credential-label">Heslo:</span>
              <span className="credential-value">demo123</span>
            </div>
          </div>

          <button className="demo-button" onClick={onStartApp}>
            Spustit aplikaci
          </button>

          <p className="demo-note">
            * Demo verze obsahuje všechny funkce. Data se ukládají pouze v prohlížeči.
          </p>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2024 Týdenní jídelníček. Všechna práva vyhrazena.</p>
      </footer>
    </div>
  );
}

export default LandingPage;