/**
 * SourceCitationPanel Component
 * Displays retrieved sources with expandable/collapsible citations
 * Part of RAG Phase 1 implementation
 */

import React, { useState } from 'react';
import styles from './SourceCitationPanel.module.css';

/**
 * SourceCitationPanel
 * Props:
 *   sources: Array of { source_type, source_id, label, timestamp, snippet, score }
 *   confidence: "high" | "medium" | "low"
 *   warnings: Array of warning messages
 *   retrieval_type: "structured" | "hybrid" | "none"
 *   isExpanded: Boolean - whether to show by default
 */
const SourceCitationPanel = ({
  sources = [],
  confidence = "low",
  warnings = [],
  retrieval_type = "none",
  isExpanded = false
}) => {
  const [expanded, setExpanded] = useState(isExpanded);

  const confidenceColor = {
    high: '#10b981',    // green
    medium: '#f59e0b',  // amber
    low: '#ef4444',     // red
  }[confidence] || '#6b7280';

  const confidenceLabel = {
    high: 'High Confidence',
    medium: 'Medium Confidence',
    low: 'Low Confidence',
  }[confidence] || 'Unknown';

  const sourceTypeLabel = {
    patient: '👤 Patient Record',
    appointment: '📅 Appointment',
    medical_act: '🏥 Medical Act',
    act_result: '🧪 Test Result',
    patient_note: '📝 Patient Note',
    pdf_extract: '📄 Document',
    chat_summary: '💬 Chat Summary',
  };

  const sourceTypeIcon = {
    patient: '👤',
    appointment: '📅',
    medical_act: '🏥',
    act_result: '🧪',
    patient_note: '📝',
    pdf_extract: '📄',
    chat_summary: '💬',
  };

  const hasWarnings = warnings && warnings.length > 0;
  const hasSources = sources && sources.length > 0;

  // Don't render if no sources or warnings
  if (!hasSources && !hasWarnings) {
    return null;
  }

  return (
    <div className={styles.citationPanel}>
      {/* Header with toggle */}
      <div
        className={styles.header}
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex="0"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setExpanded(!expanded);
          }
        }}
      >
        <div className={styles.headerLeft}>
          <span className={styles.toggleIcon}>
            {expanded ? '▼' : '▶'}
          </span>
          <span className={styles.headerTitle}>
            {expanded ? 'Sources & Evidence' : 'View Sources'}
          </span>
        </div>

        {/* Confidence badge */}
        <div
          className={styles.confidenceBadge}
          style={{ backgroundColor: confidenceColor }}
        >
          <span className={styles.confidenceLabel}>{confidenceLabel}</span>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className={styles.content}>
          {/* Warnings section */}
          {hasWarnings && (
            <div className={styles.warningSection}>
              <div className={styles.warningTitle}>⚠️ Notices</div>
              <ul className={styles.warningList}>
                {warnings.map((warning, idx) => (
                  <li key={idx} className={styles.warningItem}>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sources section */}
          {hasSources && (
            <div className={styles.sourcesSection}>
              <div className={styles.sourcesTitle}>
                📚 Retrieved Evidence ({sources.length})
              </div>

              {/* Metadata */}
              <div className={styles.metadata}>
                <span>
                  Retrieval: <strong>{retrieval_type}</strong>
                </span>
                {sources.some(s => s.score !== null) && (
                  <span>
                    Avg Score: <strong>{
                      (sources.reduce((sum, s) => sum + (s.score || 0), 0) / sources.length).toFixed(2)
                    }</strong>
                  </span>
                )}
              </div>

              {/* Sources list */}
              <div className={styles.sourcesList}>
                {sources.map((source, idx) => (
                  <div key={idx} className={styles.sourceItem}>
                    {/* Source header */}
                    <div className={styles.sourceHeader}>
                      <span className={styles.sourceIcon}>
                        {sourceTypeIcon[source.source_type] || '📌'}
                      </span>
                      <div className={styles.sourceInfo}>
                        <div className={styles.sourceName}>
                          {sourceTypeLabel[source.source_type] || source.source_type}
                          <span className={styles.sourceId}>
                            #{source.source_id}
                          </span>
                        </div>
                        {source.label && (
                          <div className={styles.sourceLabel}>{source.label}</div>
                        )}
                      </div>
                      {source.score !== null && source.score !== undefined && (
                        <div className={styles.scoreTag}>
                          {(source.score * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>

                    {/* Source snippet */}
                    {source.snippet && (
                      <div className={styles.snippet}>
                        "{source.snippet}"
                      </div>
                    )}

                    {/* Timestamp */}
                    {source.timestamp && (
                      <div className={styles.timestamp}>
                        🕐 {new Date(source.timestamp).toLocaleDateString(
                          'en-US',
                          { year: 'numeric', month: 'short', day: 'numeric' }
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className={styles.footer}>
            <small>
              💡 Sources are cited for evidence verification and transparency.
              Critical decisions should be validated with full medical records.
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceCitationPanel;
