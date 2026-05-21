/**
 * Expandable citations / confidence for grounded RAG responses.
 */

import React, { useState } from 'react';
import styles from './SourceCitationPanel.module.css';

const LABELS_FR = {
  high: 'Confiance élevée',
  medium: 'Confiance moyenne',
  low: 'Confiance faible',
  viewSources: 'Voir les sources',
  sourcesEvidence: 'Sources et preuves',
  notices: 'Avis',
  retrieval: 'Récupération',
  footer:
    'Les sources servent à vérifier les informations. Validez toujours avec le dossier complet.',
};

const LABELS_EN = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence',
  viewSources: 'View sources',
  sourcesEvidence: 'Sources & evidence',
  notices: 'Notices',
  retrieval: 'Retrieval',
  footer: 'Verify critical decisions against full medical records.',
};

const sourceTypeLabelFr = {
  patient: 'Dossier patient',
  appointment: 'Rendez-vous',
  medical_act: 'Acte médical',
  act_result: 'Résultat biologique',
  patient_note: 'Note patient',
  act_note: 'Note acte',
  pdf_extract: 'Document',
  chat_summary: 'Résumé conversation',
};

const SourceCitationPanel = ({
  sources = [],
  confidence = 'low',
  warnings = [],
  retrieval_type = 'none',
  isExpanded = false,
  locale = 'fr',
}) => {
  const [expanded, setExpanded] = useState(isExpanded);
  const L = locale === 'fr' ? LABELS_FR : LABELS_EN;

  const confidenceColor = {
    high: '#10b981',
    medium: '#f59e0b',
    low: '#ef4444',
  }[confidence] || '#6b7280';

  const hasWarnings = warnings && warnings.length > 0;
  const hasSources = sources && sources.length > 0;

  if (!hasSources && !hasWarnings && confidence === 'high') {
    return null;
  }

  return (
    <div className={styles.citationPanel}>
      <div
        className={styles.header}
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setExpanded(!expanded);
        }}
      >
        <div className={styles.headerLeft}>
          <span className={styles.toggleIcon}>{expanded ? '▼' : '▶'}</span>
          <span className={styles.headerTitle}>
            {expanded ? L.sourcesEvidence : L.viewSources}
            {hasSources ? ` (${sources.length})` : ''}
          </span>
        </div>
        <div className={styles.confidenceBadge} style={{ backgroundColor: confidenceColor }}>
          <span className={styles.confidenceLabel}>{L[confidence] || confidence}</span>
        </div>
      </div>

      {expanded && (
        <div className={styles.content}>
          {hasWarnings && (
            <div className={styles.warningSection}>
              <div className={styles.warningTitle}>⚠️ {L.notices}</div>
              <ul className={styles.warningList}>
                {warnings.map((warning, idx) => (
                  <li key={idx} className={styles.warningItem}>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasSources && (
            <div className={styles.sourcesSection}>
              <div className={styles.metadata}>
                <span>
                  {L.retrieval}: <strong>{retrieval_type}</strong>
                </span>
              </div>
              <div className={styles.sourcesList}>
                {sources.map((source, idx) => (
                  <div key={idx} className={styles.sourceItem}>
                    <div className={styles.sourceHeader}>
                      <div className={styles.sourceInfo}>
                        <div className={styles.sourceName}>
                          {(locale === 'fr' ? sourceTypeLabelFr : {})[source.source_type] ||
                            source.source_type}
                          <span className={styles.sourceId}>#{source.source_id}</span>
                        </div>
                        {source.label && (
                          <div className={styles.sourceLabel}>{source.label}</div>
                        )}
                      </div>
                    </div>
                    {source.snippet && (
                      <div className={styles.snippet}>"{source.snippet}"</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.footer}>
            <small>{L.footer}</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceCitationPanel;
