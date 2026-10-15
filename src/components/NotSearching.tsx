import React from 'react';
import { t } from '../utils/i18n';
import { UserNode } from '../model/user';

interface NotSearchingProps {
  onScan?: () => void;
  cachedScan?: { readonly results: readonly UserNode[]; readonly timestamp: number } | null;
  onLoadCached?: () => void;
}

export const NotSearching = ({ onScan, cachedScan, onLoadCached }: NotSearchingProps) => (
  <section className="launch-screen">
    <div className="launch-copy">
      <span className="eyebrow">{t("localAccountAudit")}</span>
      <h1>{t("launchTitle")}</h1>
      <p>
        {t("launchDescription")}
      </p>
      <div className="launch-actions">
        <button className="run-scan" onClick={onScan}>
          {t("runScan")}
        </button>
        {cachedScan && cachedScan.results.length > 0 && onLoadCached && (
          <button type="button" className="load-cached-scan" onClick={onLoadCached}>
            ⚡ {t("loadCachedScan", cachedScan.results.length)}
          </button>
        )}
        <span className="launch-note">{t("runsInBrowserOnly")}</span>
      </div>
    </div>
    <div className="launch-panel" aria-hidden="true">
      <div className="scan-orbit">
        <span />
        <span />
        <span />
      </div>
      <div className="signal-card primary">
        <span>{t("ready")}</span>
        <strong>{cachedScan ? `${cachedScan.results.length}` : "0%"}</strong>
      </div>
      <div className="signal-card">
        <span>{t("protected")}</span>
        <strong>{t("whitelist")}</strong>
      </div>
      <div className="signal-card accent">
        <span>{t("review")}</span>
        <strong>{t("selectFirst")}</strong>
      </div>
    </div>
  </section>
);
