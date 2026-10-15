import React from 'react';
import { bulkActionForAuditMode } from '../model/audit-mode';
import { ResultsLens, resultsForLens } from '../model/scan-snapshots';
import { assertUnreachable, getCurrentPageUnfollowers, getMaxPage, getUsersForDisplay, isWithoutProfilePicture } from '../utils/utils';
import { State } from '../model/state';
import { UserNode } from '../model/user';
import { WHITELISTED_RESULTS_STORAGE_KEY } from '../constants/constants';
import { getActiveAdapter } from '../platform/runtime';
import { t } from '../utils/i18n';


export interface SearchingProps {
  state: State;
  setState: (state: State) => void;
  scanningPaused: boolean;
  pauseScan: () => void;
  handleScanFilter: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleUser: (checked: boolean, user: UserNode) => void;
  UserCheckIcon: React.FC;
  UserUncheckIcon: React.FC;
}

export const Searching = ({
  state,
  setState,
  scanningPaused,
  pauseScan,
  handleScanFilter,
  toggleUser,
  UserCheckIcon,
  UserUncheckIcon,
}: SearchingProps) => {
  if (state.status !== 'scanning') {
    return null;
  }

  const usersForDisplay = getUsersForDisplay(
    state.results,
    state.whitelistedResults,
    state.currentTab,
    state.searchTerm,
    state.filter,
    state.resultsLens,
  );
  const queueAction = bulkActionForAuditMode(state.resultsLens);
  const capabilities = getActiveAdapter().capabilities;

  const setResultsLens = (lens: ResultsLens) => {
    if (state.resultsLens === lens) {
      return;
    }
    if (lens === 'followers_manage' && !capabilities.removeFollower) {
      return;
    }
    setState({
      ...state,
      resultsLens: lens,
      results: resultsForLens(state.scanSnapshots, lens),
      page: 1,
      selectedResults: [],
    });
  };
  const isRemoveFollower = queueAction === 'remove_follower';

  const handleSelectedWhitelistAction = () => {
    if (state.selectedResults.length === 0) {
      return;
    }

    let whitelistedResults: readonly UserNode[] = [];

    switch (state.currentTab) {
      case 'non_whitelisted': {
        const existingIds = new Set(state.whitelistedResults.map(user => user.id));
        const usersToAdd = state.selectedResults.filter(user => !existingIds.has(user.id));
        whitelistedResults = [...state.whitelistedResults, ...usersToAdd];
        break;
      }

      case 'whitelisted': {
        const selectedIds = new Set(state.selectedResults.map(user => user.id));
        whitelistedResults = state.whitelistedResults.filter(user => !selectedIds.has(user.id));
        break;
      }

      default:
        assertUnreachable(state.currentTab);
    }

    localStorage.setItem(
      WHITELISTED_RESULTS_STORAGE_KEY,
      JSON.stringify(whitelistedResults),
    );
    setState({
      ...state,
      whitelistedResults,
      selectedResults: [],
    });
  };

  return (
    <section className='workspace-layout'>
      <aside className='app-sidebar'>
        <div className='sidebar-content'>
          <div className='panel-heading'>
            <span>{t('scanner')}</span>
            <strong>{state.percentage}%</strong>
          </div>
          {!state.isScanningActive && (state.results.length > 0 || state.scanSnapshots.followingAll.length > 0) && (
            <div className='lens-switcher' role='tablist' aria-label={t('resultsLensTitle')}>
              <p>{t('resultsLensTitle')}</p>
              <button
                type='button'
                className={`lens-btn ${state.resultsLens === 'non_followers' ? 'lens-btn-active' : ''}`}
                onClick={() => setResultsLens('non_followers')}
              >
                {t('auditModeNonFollowers')}
              </button>
              <button
                type='button'
                className={`lens-btn ${state.resultsLens === 'following_all' ? 'lens-btn-active' : ''}`}
                onClick={() => setResultsLens('following_all')}
              >
                {t('auditModeFollowingAll')}
              </button>
              <button
                type='button'
                className={`lens-btn ${state.resultsLens === 'followers_manage' ? 'lens-btn-active' : ''}`}
                disabled={!capabilities.removeFollower || state.scanSnapshots.followersAll.length === 0}
                title={!capabilities.removeFollower ? t('removeFollowerUnsupported') : undefined}
                onClick={() => setResultsLens('followers_manage')}
              >
                {t('auditModeFollowersManage')}
              </button>
            </div>
          )}
          <menu className='sidebar-filters-grid'>
            <p>{t('filters')}</p>
            {state.resultsLens === 'following_all' && (
              <>
                <label className='badge m-small'>
                  <input
                    type='checkbox'
                    name='showFollowsViewer'
                    checked={state.filter.showFollowsViewer}
                    onChange={handleScanFilter}
                  />
                  &nbsp;{t('followers')}
                </label>
                <label className='badge m-small'>
                  <input
                    type='checkbox'
                    name='showNotFollowsViewer'
                    checked={state.filter.showNotFollowsViewer}
                    onChange={handleScanFilter}
                  />
                  &nbsp;{t('nonFollowers')}
                </label>
              </>
            )}
            <label className='badge m-small'>
              <input
                type='checkbox'
                name='showVerified'
                checked={state.filter.showVerified}
                onChange={handleScanFilter}
              />
              &nbsp;{t('verified')}
            </label>
            <label className='badge m-small'>
              <input
                type='checkbox'
                name='showPrivate'
                checked={state.filter.showPrivate}
                onChange={handleScanFilter}
              />
              &nbsp;{t('private')}
            </label>
            <label className='badge m-small'>
              <input
                type='checkbox'
                name='showWithOutProfilePicture'
                checked={state.filter.showWithOutProfilePicture}
                onChange={handleScanFilter}
              />
              &nbsp;{t('noPic')}
            </label>
          </menu>

          <div className='sidebar-buttons-grid'>
            <button
              className='button-secondary'
              disabled={Boolean(state.isScanningActive)}
              onClick={() => {
                const verifiedUsers = usersForDisplay.filter(u => u.is_verified);
                const currentIds = new Set(state.selectedResults.map(u => u.id));
                const toAdd = verifiedUsers.filter(u => !currentIds.has(u.id));
                setState({ ...state, selectedResults: [...state.selectedResults, ...toAdd] });
              }}
            >
              {t('verified')}
            </button>
            <button
              className='button-secondary'
              disabled={Boolean(state.isScanningActive)}
              onClick={() => {
                const privateUsers = usersForDisplay.filter(u => u.is_private);
                const currentIds = new Set(state.selectedResults.map(u => u.id));
                const toAdd = privateUsers.filter(u => !currentIds.has(u.id));
                setState({ ...state, selectedResults: [...state.selectedResults, ...toAdd] });
              }}
            >
              {t('private')}
            </button>
            <button
              className='button-secondary'
              disabled={Boolean(state.isScanningActive)}
              onClick={() => {
                const noPicUsers = usersForDisplay.filter(u => isWithoutProfilePicture(u));
                const currentIds = new Set(state.selectedResults.map(u => u.id));
                const toAdd = noPicUsers.filter(u => !currentIds.has(u.id));
                setState({ ...state, selectedResults: [...state.selectedResults, ...toAdd] });
              }}
            >
              {t('noPic')}
            </button>
            <button
              className='button-secondary danger-text'
              disabled={Boolean(state.isScanningActive)}
              onClick={() => setState({ ...state, selectedResults: [] })}
            >
              {t('clear')}
            </button>
          </div>
          {state.selectedResults.length > 0 && (
            <button
              className='button-secondary sidebar-whitelist-action'
              onClick={handleSelectedWhitelistAction}
            >
              {state.currentTab === 'non_whitelisted' ? t('addToWhitelist') : t('removeFromWhitelist')} ({state.selectedResults.length})
            </button>
          )}
          <div className='sidebar-stats metric-stack'>
            <p><span>{t('displayed')}</span><strong>{usersForDisplay.length}</strong></p>
            <p><span>{t('totalScanned')}</span><strong>{state.totalScanned ?? state.results.length}</strong></p>
            <p className='whitelist-counter'>
              <span>{t('whitelist')}</span><strong>★ {state.whitelistedResults.length}</strong>
            </p>
          </div>

          {!state.isScanningActive && state.scanSnapshots.followingAll.length > 0 && (
            <div className='sidebar-summary'>
              <h4>{t('scanSummary')}</h4>
              <div className='summary-grid'>
                <div className='summary-item'>
                  <span>{t('auditModeNonFollowers')}</span>
                  <strong>{state.scanSnapshots.nonFollowers.length}</strong>
                </div>
                <div className='summary-item'>
                  <span>{t('auditModeFollowingAll')}</span>
                  <strong>{state.scanSnapshots.followingAll.length}</strong>
                </div>
                <div className='summary-item'>
                  <span>{t('auditModeFollowersManage')}</span>
                  <strong>{state.scanSnapshots.followersAll.length}</strong>
                </div>
              </div>
            </div>
          )}
          <div className='sidebar-footer-controls'>
            <button
              className='button-control button-pause'
              onClick={pauseScan}
            >
              {scanningPaused ? t('resume') : t('pause')}
            </button>
            <div className='sidebar-pagination'>
              <div className='pagination-controls'>
                <a
                  onClick={() => {
                    if (state.page - 1 > 0) {
                      setState({
                        ...state,
                        page: state.page - 1,
                      });
                    }
                  }}
                >
                  ❮
                </a>
                <span>
                  {state.page}/{getMaxPage(usersForDisplay)}
                </span>
                <a
                  onClick={() => {
                    if (state.page < getMaxPage(usersForDisplay)) {
                      setState({
                        ...state,
                        page: state.page + 1,
                      });
                    }
                  }}
                >
                  ❯
                </a>
              </div>
            </div>
          </div>
        </div>
        <button
          className='unfollow'
          disabled={state.scanIncomplete || Boolean(state.isScanningActive) || state.selectedResults.length === 0}
          title={
            state.isScanningActive
              ? t('scanInProgressWait')
              : state.scanIncomplete
              ? t('unfollowDisabledPartialScan')
              : undefined
          }
          onClick={() => {
            if (state.scanIncomplete) {
              alert(t('unfollowDisabledPartialScan'));
              return;
            }
            const confirmKey = isRemoveFollower ? 'removeFollowerConfirm' : 'unfollowConfirm';
            if (!confirm(t(confirmKey))) {
              return;
            }
            // TODO TEMP until types are properly fixed
            // @ts-ignore
            setState(prevState => {
              if (prevState.status !== 'scanning') {
                return prevState;
              }
              if (prevState.selectedResults.length === 0) {
                alert(t('selectAtLeastOneUser'));
                return prevState;
              }
              const newState: State = {
                ...prevState,
                status: 'unfollowing',
                queueAction,
                percentage: 0,
                unfollowLog: [],
                filter: {
                  showSucceeded: true,
                  showFailed: true,
                },
              };
              return newState;
            });
          }}
        >
          {isRemoveFollower
            ? t('removeFollowerCount', state.selectedResults.length)
            : t('unfollowCount', state.selectedResults.length)}
        </button>
      </aside>
      <article className='results-container'>
        {state.scanIncomplete && (
          <div className='scan-warning-banner scan-incomplete-banner' role='alert'>
            <span>{t('partialScanWarning')}</span>
          </div>
        )}
        <nav className='tabs-container'>
          <button
            type='button'
            className={`tab ${state.currentTab === 'non_whitelisted' ? 'tab-active' : ''}`}
            onClick={() => {
              if (state.currentTab === 'non_whitelisted') {
                return;
              }
              setState({
                ...state,
                currentTab: 'non_whitelisted',
                page: 1,
              });
            }}
          >
            {t('nonWhitelistedTab')}
          </button>
          <button
            type='button'
            className={`tab ${state.currentTab === 'whitelisted' ? 'tab-active' : ''}`}
            onClick={() => {
              if (state.currentTab === 'whitelisted') {
                return;
              }
              setState({
                ...state,
                currentTab: 'whitelisted',
                page: 1,
              });
            }}
          >
            {t('whitelistedTab')}
          </button>
        </nav>
        {getCurrentPageUnfollowers(usersForDisplay, state.page).map((user, index, pageUsers) => {
          const firstLetter = user.username.substring(0, 1).toUpperCase();
          const prevLetter =
            index > 0
              ? pageUsers[index - 1].username.substring(0, 1).toUpperCase()
              : '';
          const showLetterHeader = firstLetter !== prevLetter;
          return (
            <React.Fragment key={user.id}>
              {showLetterHeader && (
                <div className='alphabet-character'>{firstLetter}</div>
              )}
              <label className='result-item'>
                <div className='flex grow align-center'>
                  <div
                    className='avatar-container'
                    onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                      // Prevent selecting result when trying to add to whitelist.
                      e.preventDefault();
                      e.stopPropagation();
                      let whitelistedResults: readonly UserNode[] = [];
                      switch (state.currentTab) {
                        case 'non_whitelisted':
                          whitelistedResults = [...state.whitelistedResults, user];
                          break;

                        case 'whitelisted':
                          whitelistedResults = state.whitelistedResults.filter(
                            result => result.id !== user.id,
                          );
                          break;

                        default:
                          assertUnreachable(state.currentTab);
                      }
                      localStorage.setItem(
                        WHITELISTED_RESULTS_STORAGE_KEY,
                        JSON.stringify(whitelistedResults),
                      );
                      setState({ ...state, whitelistedResults });
                    }}
                  >
                    <img
                      className='avatar'
                      alt={user.username}
                      src={user.profile_pic_url}
                    />
                    <span className='avatar-icon-overlay-container'>
                      {state.currentTab === 'non_whitelisted' ? (
                        <UserCheckIcon />
                      ) : (
                        <UserUncheckIcon />
                      )}
                    </span>
                  </div>
                  <div className='flex column m-medium'>
                    <a
                      className='fs-xlarge'
                      target='_blank'
                      href={`/${user.username}`}
                      rel='noreferrer'
                    >
                      {user.username}
                    </a>
                    <span className='fs-medium'>{user.full_name}</span>
                  </div>
                  {state.resultsLens === 'following_all' && (
                    <span className={`relationship-badge ${user.follows_viewer ? 'relationship-mutual' : 'relationship-one-way'}`}>
                      {user.follows_viewer ? t('followsYouBadge') : t('notFollowsYouBadge')}
                    </span>
                  )}
                  {user.is_verified && <div className='verified-badge'>✔</div>}
                  {user.is_private && (
                    <div className='flex justify-center w-100'>
                      <span className='private-indicator'>{t('private')}</span>
                    </div>
                  )}
                </div>
                <div className='flex align-center gap-small'>
                  <input
                    className='account-checkbox'
                    type='checkbox'
                    disabled={Boolean(state.isScanningActive)}
                    checked={state.selectedResults.some(result => result.id === user.id)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => toggleUser(e.currentTarget.checked, user)}
                  />
                </div>
              </label>
            </React.Fragment>
          );
        })}
      </article>
    </section>
  );
};
