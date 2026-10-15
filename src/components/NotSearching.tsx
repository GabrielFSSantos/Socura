import React from "react";
import { AuditMode, DEFAULT_AUDIT_MODE } from "../model/audit-mode";
import { PlatformCapabilities } from "../platform/types";
import { t } from "../utils/i18n";
import { UserNode } from "../model/user";

interface NotSearchingProps {
  onScan?: (mode: AuditMode) => void;
  cachedScan?: { readonly results: readonly UserNode[]; readonly timestamp: number } | null;
  onLoadCached?: () => void;
  auditMode: AuditMode;
  onAuditModeChange: (mode: AuditMode) => void;
  capabilities: PlatformCapabilities;
}

const modeHint = (mode: AuditMode): string => {
  switch (mode) {
    case "non_followers":
      return t("auditModeHintNonFollowers");
    case "following_all":
      return t("auditModeHintFollowingAll");
    case "followers_manage":
      return t("auditModeHintFollowersManage");
    default:
      return "";
  }
};

export const NotSearching = ({
  onScan,
  cachedScan,
  onLoadCached,
  auditMode,
  onAuditModeChange,
  capabilities,
}: NotSearchingProps) => (
  <section className="launch-screen">
    <div className="launch-copy">
      <span className="eyebrow">{t("localAccountAudit")}</span>
      <h1>{t("launchTitle")}</h1>
      <p>{t("launchDescription")}</p>
      <fieldset className="audit-mode-fieldset">
        <legend>{t("localAccountAudit")}</legend>
        <label className="audit-mode-option">
          <input
            type="radio"
            name="auditMode"
            checked={auditMode === "non_followers"}
            onChange={() => onAuditModeChange("non_followers")}
          />
          {t("auditModeNonFollowers")}
        </label>
        <label className="audit-mode-option">
          <input
            type="radio"
            name="auditMode"
            checked={auditMode === "following_all"}
            onChange={() => onAuditModeChange("following_all")}
          />
          {t("auditModeFollowingAll")}
        </label>
        <label className="audit-mode-option">
          <input
            type="radio"
            name="auditMode"
            checked={auditMode === "followers_manage"}
            disabled={!capabilities.removeFollower}
            onChange={() => onAuditModeChange("followers_manage")}
          />
          {t("auditModeFollowersManage")}
        </label>
        <p className="audit-mode-hint muted">{modeHint(auditMode)}</p>
      </fieldset>
      <div className="launch-actions">
        <button className="run-scan" type="button" onClick={() => onScan?.(auditMode ?? DEFAULT_AUDIT_MODE)}>
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
