import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './LegalPage.css';

function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      <div className="legal-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Retour
        </button>
        
        <h1>Politique de confidentialité</h1>
        <p className="last-updated">Dernière mise à jour : 1er Février 2026</p>

        <section>
          <h2>1. Collecte des données</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
        </section>

        <section>
          <h2>2. Utilisation des données</h2>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>
          <ul>
            <li>Amélioration de nos services médicaux</li>
            <li>Communication avec les professionnels de santé</li>
            <li>Analyse et recherche clinique anonymisée</li>
          </ul>
        </section>

        <section>
          <h2>3. Protection des données</h2>
          <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam. Toutes les données sont stockées localement et ne sont jamais transmises à des serveurs externes.</p>
        </section>

        <section>
          <h2>4. Vos droits</h2>
          <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit. Vous avez le droit d'accéder, de rectifier et de supprimer vos données personnelles.</p>
        </section>

        <section>
          <h2>5. Contact</h2>
          <p>Pour toute question concernant vos données, contactez notre DPO à : <a href="mailto:dpo@cdbakraoui.ma">dpo@cdbakraoui.ma</a></p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPage;
