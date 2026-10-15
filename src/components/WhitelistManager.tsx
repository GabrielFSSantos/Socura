import React, { useRef, useState } from 'react';
import { Typename, UserNode } from '../model/user';
import { exportWhitelist, importWhitelist, clearWhitelist, mergeWhitelists } from '../utils/whitelist-manager';
import { t } from '../utils/i18n';

interface WhitelistManagerProps {
  whitelistedUsers: readonly UserNode[];
  onWhitelistUpdate: (users: readonly UserNode[]) => void;
}

export const WhitelistManager = ({ whitelistedUsers, onWhitelistUpdate }: WhitelistManagerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const handleExport = () => {
    const ok = exportWhitelist(whitelistedUsers);
    if (!ok) {
      setMessage({ type: 'error', text: t('whitelistExportEmpty') });
      setTimeout(() => setMessage(null), 4000);
      return;
    }
    setMessage({ type: 'success', text: t('whitelistExported') });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) {
return;
}

    importWhitelist(
      file,
      importedUsers => {
        let finalUsers: readonly UserNode[];

        if (importMode === 'merge') {
          finalUsers = mergeWhitelists(whitelistedUsers, importedUsers);
          const newUsersCount = finalUsers.length - whitelistedUsers.length;
          setMessage({
            type: 'success',
            text: t(
              'whitelistImportMerged',
              newUsersCount,
              importedUsers.length,
              importedUsers.length - newUsersCount,
            ),
          });
        } else {
          finalUsers = importedUsers;
          setMessage({
            type: 'success',
            text: t('whitelistImportReplaced', importedUsers.length),
          });
        }

        onWhitelistUpdate(finalUsers);
        setTimeout(() => setMessage(null), 5000);
      },
      errorMessage => {
        setMessage({ type: 'error', text: errorMessage });
        setTimeout(() => setMessage(null), 5000);
      },
    );

    event.currentTarget.value = '';
  };

  const handleClear = () => {
    if (!confirm(t('clearWhitelistConfirm'))) {
      return;
    }
    clearWhitelist();
    onWhitelistUpdate([]);
    setMessage({ type: 'success', text: t('whitelistCleared') });
    setTimeout(() => setMessage(null), 3000);
  };

  const handlePasteSubmit = () => {
    const rawTokens = pasteText
      .split(/[\s,;\n\r\t]+/)
      .map(s => s.replace(/^@+/, '').trim().toLowerCase())
      .filter(s => s.length > 0 && /^[a-zA-Z0-9._]+$/.test(s));

    if (rawTokens.length === 0) {
      setMessage({ type: 'error', text: t('noValidUsernamesFound') });
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    const uniqueUsernames = Array.from(new Set(rawTokens));
    const existingUsernames = new Set(whitelistedUsers.map(u => u.username.toLowerCase()));
    const toAdd = uniqueUsernames.filter(u => !existingUsernames.has(u));

    if (toAdd.length === 0) {
      setMessage({ type: 'success', text: t('pastedUsersAlreadyExist') });
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    const newNodes: UserNode[] = toAdd.map(username => ({
      id: `pasted_${username}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username,
      full_name: username,
      profile_pic_url: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(username)}&backgroundColor=0f172a,1f2937,312e81&fontFamily=Verdana`,
      is_private: false,
      is_verified: false,
      followed_by_viewer: true,
      follows_viewer: false,
      requested_by_viewer: false,
      reel: {
        id: `pasted_${username}_${Date.now()}`,
        expiring_at: 0,
        has_pride_media: false,
        latest_reel_media: 0,
        seen: null,
        owner: {
          __typename: Typename.GraphUser,
          id: `pasted_${username}_${Date.now()}`,
          profile_pic_url: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(username)}`,
          username,
        },
      },
    }));

    const updated = [...whitelistedUsers, ...newNodes];
    onWhitelistUpdate(updated);
    setPasteText('');
    setShowPasteArea(false);
    setMessage({
      type: 'success',
      text: t('pastedUsersAdded', newNodes.length),
    });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className='whitelist-manager'>
      <div className='whitelist-header'>
        <h4>{t('whitelistTitle')}</h4>
        <span className='whitelist-count'>
          {whitelistedUsers.length} {whitelistedUsers.length === 1 ? t('userSingular') : t('userPlural')}
        </span>
      </div>

      {message && (
        <div className={`whitelist-message ${message.type === 'error' ? 'error' : 'success'}`}>
          {message.text}
        </div>
      )}

      <div className='whitelist-actions'>
        <button
          className='btn btn-export'
          onClick={handleExport}
          disabled={whitelistedUsers.length === 0}
          title={whitelistedUsers.length === 0 ? t('whitelistNoUsers') : t('exportWhitelist')}
        >
          📥 {t('exportWhitelist')}
        </button>

        <div className='import-section'>
          <div className='import-mode'>
            <label>
              <input
                type='radio'
                name='importMode'
                value='merge'
                checked={importMode === 'merge'}
                onChange={() => setImportMode('merge')}
              />
              {t('mergeWhitelist')}
            </label>
            <label>
              <input
                type='radio'
                name='importMode'
                value='replace'
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
              />
              {t('replaceWhitelist')}
            </label>
          </div>

          <button
            className='btn btn-import'
            onClick={handleImportClick}
            title={t('importWhitelist')}
          >
            📤 {t('importWhitelist')}
          </button>
          <input
            ref={fileInputRef}
            type='file'
            accept='.json'
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        <button
          type='button'
          className='btn btn-paste'
          onClick={() => setShowPasteArea(!showPasteArea)}
          title={t('pasteWhitelist')}
        >
          📋 {t('pasteWhitelist')}
        </button>

        <button
          className='btn btn-clear'
          onClick={handleClear}
          disabled={whitelistedUsers.length === 0}
          title={t('clearWhitelist')}
        >
          🗑️ {t('clearWhitelist')}
        </button>
      </div>

      {showPasteArea && (
        <div className='paste-whitelist-box'>
          <textarea
            className='paste-whitelist-textarea'
            placeholder={t('pasteWhitelistPlaceholder')}
            value={pasteText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPasteText(e.currentTarget.value)}
            rows={3}
          />
          <button
            type='button'
            className='btn btn-paste-submit'
            onClick={handlePasteSubmit}
          >
            ➕ {t('addPastedToWhitelist')}
          </button>
        </div>
      )}

      <div className='whitelist-info'>
        <p className='info-text'>
          <strong>💡 Dica:</strong> {t('whitelistTip')}
        </p>
      </div>
    </div>
  );
};
