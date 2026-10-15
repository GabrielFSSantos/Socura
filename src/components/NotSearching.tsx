import React from 'react';
import { t } from '../utils/i18n';
import { ScanSnapshots } from '../model/scan-snapshots';

interface NotSearchingProps {
  onScan?: () => void;
  cachedScan?: { readonly snapshots: ScanSnapshots; readonly timestamp: number } | null;
  onLoadCached?: () => void;
  cachedAccountCount: number;
}

export const NotSearching = ({
  onScan,
  cachedScan,
  onLoadCached,
  cachedAccountCount,
}: NotSearchingProps) => (
  <section className='launch-screen'>
    <div className='launch-copy'>
      <span className='eyebrow'>{t('localAccountAudit')}</span>
      <h1>{t('launchTitle')}</h1>
      <p>{t('launchDescription')}</p>
      <p className='audit-mode-hint muted'>{t('launchAfterScanHint')}</p>
      <div className='launch-actions'>
        <button className='run-scan' type='button' onClick={() => onScan?.()}>
          {t('runScan')}
        </button>
        {cachedScan && cachedAccountCount > 0 && onLoadCached && (
          <button type='button' className='load-cached-scan' onClick={onLoadCached}>
            ⚡ {t('loadCachedScan', cachedAccountCount)}
          </button>
        )}
        <span className='launch-note'>{t('runsInBrowserOnly')}</span>
      </div>
    </div>
    <div className='launch-panel' aria-hidden='true'>
      <div className='scan-orbit'>
        <span />
        <span />
        <span />
      </div>
      <div className='signal-card primary'>
        <span>{t('ready')}</span>
        <strong>{cachedAccountCount > 0 ? String(cachedAccountCount) : '0%'}</strong>
      </div>
      <div className='signal-card'>
        <span>{t('protected')}</span>
        <strong>{t('whitelist')}</strong>
      </div>
      <div className='signal-card accent'>
        <span>{t('review')}</span>
        <strong>{t('selectFirst')}</strong>
      </div>
    </div>
  </section>
);
