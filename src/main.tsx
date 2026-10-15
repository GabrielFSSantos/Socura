import React, { ChangeEvent, useEffect, useState } from 'react';
import { render } from 'react-dom';
import './styles.scss';

import { Typename, UserNode } from './model/user';
import { Toast } from './components/Toast';
import { UserCheckIcon } from './components/icons/UserCheckIcon';
import { UserUncheckIcon } from './components/icons/UserUncheckIcon';
import { assertUnreachable, getCurrentPageUnfollowers, getUsersForDisplay } from './utils/utils';
import {
  installXApiHeaderCapture,
  persistXBearerFromPage,
  waitForXApiMirror,
} from './platform/x/x-http';
import { resolveAdapter } from './platform/resolve-adapter';
import { getActiveAdapter, setActiveAdapter } from './platform/runtime';
import { DEFAULT_AUDIT_MODE } from './model/audit-mode';
import {
  buildPreviewSnapshots,
  EMPTY_SCAN_SNAPSHOTS,
  ResultsLens,
  resultsForLens,
  ScanSnapshots,
} from './model/scan-snapshots';
import { DEFAULT_SCANNING_FILTER } from './model/scanning-filter';
import { runAccountScan } from './services/scan-service';
import { runActionQueue } from './services/action-queue';
import { NotSearching } from './components/NotSearching';
import { State } from './model/state';
import { Searching } from './components/Searching';
import { Toolbar } from './components/Toolbar';
import { Unfollowing } from './components/Unfollowing';
import { Timings } from './model/timings';
import { loadCachedScanResults, loadTimings, loadWhitelist, saveCachedScanResults, saveTimings, saveWhitelist } from './utils/whitelist-manager';
import { DEFAULT_MAX_BULK_ACTIONS_PER_SESSION } from './constants/constants';
import { t } from './utils/i18n';

const LOCAL_PREVIEW_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
const isLocalPreview = LOCAL_PREVIEW_HOSTS.has(location.hostname);
const previewPlatformParam = new URLSearchParams(location.search).get('platform');
const isPreviewX = previewPlatformParam === 'x';

const _avatarUrl = (seed: string): string =>
  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0f172a,1f2937,312e81&fontFamily=Verdana`;

const _createPreviewUser = (
  id: string,
  username: string,
  fullName: string,
  options: { readonly isPrivate?: boolean; readonly isVerified?: boolean; readonly followsViewer?: boolean } = {},
): UserNode => ({
  id,
  username,
  full_name: fullName,
  profile_pic_url: _avatarUrl(username),
  is_private: options.isPrivate ?? false,
  is_verified: options.isVerified ?? false,
  followed_by_viewer: true,
  follows_viewer: options.followsViewer ?? false,
  requested_by_viewer: false,
  reel: {
    id,
    expiring_at: 0,
    has_pride_media: false,
    latest_reel_media: 0,
    seen: null,
    owner: {
      __typename: Typename.GraphUser,
      id,
      profile_pic_url: _avatarUrl(username),
      username,
    },
  },
});

const countSnapshotAccounts = (snapshots: ScanSnapshots): number =>
  Math.max(
    snapshots.nonFollowers.length,
    snapshots.followingAll.length,
    snapshots.followersAll.length,
  );

const _getPreviewUsers = (): readonly UserNode[] => [
  _createPreviewUser('1', 'alina.frames', 'Alina Moreno', { isVerified: true }),
  _createPreviewUser('2', 'brassandbone', 'Theo Walsh', { isPrivate: true }),
  _createPreviewUser('3', 'citrus.archive', 'Mara Kim', { followsViewer: true }),
  _createPreviewUser('4', 'dawnledger', 'Jon Bell', { isPrivate: true }),
  _createPreviewUser('5', 'elias.market', 'Elias Noor', { isVerified: true }),
  _createPreviewUser('6', 'fieldnotes.studio', 'Nadia Reyes'),
  _createPreviewUser('7', 'glint.supply', 'Remy Park', { followsViewer: true }),
  _createPreviewUser('8', 'harbor.sequence', 'Ivy Chen', { isPrivate: true }),
  _createPreviewUser('9', 'inkline.daily', 'Sofia Grant'),
  _createPreviewUser('10', 'juniper.signal', 'Cal Reed', { isVerified: true }),
  _createPreviewUser('11', 'keystone.labs', 'Mina Torres'),
  _createPreviewUser('12', 'lowlight.club', 'Owen Voss', { isPrivate: true }),
];


function App() {
  const previewParams = new URLSearchParams(location.search);
  const previewLens =
    (previewParams.get('mode') as ResultsLens | null) ?? DEFAULT_AUDIT_MODE;
  const previewUsers = _getPreviewUsers();
  const previewSnapshots = buildPreviewSnapshots(previewUsers);

  const [state, setState] = useState<State>({
    ...(
      isLocalPreview &&
        (previewParams.get('preview') === 'scanning' ||
          previewParams.get('preview') === 'scanning-incomplete')
        ? {
          status: 'scanning',
          resultsLens: previewLens,
          page: 1,
          searchTerm: '',
          currentTab: 'non_whitelisted',
          percentage: 100,
          scanSnapshots: previewSnapshots,
          results: resultsForLens(previewSnapshots, previewLens),
          selectedResults: previewUsers.slice(0, 3),
          whitelistedResults: previewUsers.slice(10, 12),
          scanIncomplete: previewParams.get('preview') === 'scanning-incomplete',
          filter: DEFAULT_SCANNING_FILTER,
        }
        : { status: 'initial' as const }
    ),
  });

  const [toast, setToast] = useState<{ readonly show: false } | { readonly show: true; readonly text: string }>({
    show: false,
  });

  const [timings, setTimings] = useState<Timings>(() => {
    const defaults = getActiveAdapter().getDefaultTimings();
    const storedTimings = loadTimings();
    return {
      timeBetweenSearchCycles: storedTimings?.timeBetweenSearchCycles ?? defaults.timeBetweenSearchCycles,
      timeToWaitAfterFiveSearchCycles: storedTimings?.timeToWaitAfterFiveSearchCycles ?? defaults.timeToWaitAfterFiveSearchCycles,
      timeBetweenUnfollows: storedTimings?.timeBetweenUnfollows ?? defaults.timeBetweenUnfollows,
      timeToWaitAfterFiveUnfollows: storedTimings?.timeToWaitAfterFiveUnfollows ?? defaults.timeToWaitAfterFiveUnfollows,
      usersPerSearchCycle: storedTimings?.usersPerSearchCycle ?? defaults.usersPerSearchCycle,
      maxBulkActionsPerSession:
        storedTimings?.maxBulkActionsPerSession ?? DEFAULT_MAX_BULK_ACTIONS_PER_SESSION,
    };
  });

  // Save timings whenever they change
  useEffect(() => {
    saveTimings(timings);
  }, [timings]);

  const [cachedScan, setCachedScan] = useState<{ readonly snapshots: ScanSnapshots; readonly timestamp: number } | null>(() =>
    loadCachedScanResults(),
  );

  const [scanningPaused, setScanningPaused] = useState(false);
  const scanningPausedRef = React.useRef(false);

  const pauseScan = () => {
    setScanningPaused(prev => {
      const next = !prev;
      scanningPausedRef.current = next;
      return next;
    });
  };

  let isActiveProcess: boolean;
  switch (state.status) {
    case 'initial':
      isActiveProcess = false;
      break;
    case 'scanning':
      isActiveProcess = Boolean(state.isScanningActive);
      break;
    case 'unfollowing':
      isActiveProcess = state.percentage < 100;
      break;
    default:
      assertUnreachable(state);
  }

  const onLoadCached = () => {
    if (!cachedScan || countSnapshotAccounts(cachedScan.snapshots) === 0) {
      return;
    }
    const whitelistedResults = loadWhitelist();
    setState({
      status: 'scanning',
      resultsLens: DEFAULT_AUDIT_MODE,
      page: 1,
      searchTerm: '',
      currentTab: 'non_whitelisted',
      percentage: 100,
      isScanningActive: false,
      scanSnapshots: cachedScan.snapshots,
      results: resultsForLens(cachedScan.snapshots, DEFAULT_AUDIT_MODE),
      selectedResults: [],
      whitelistedResults,
      filter: DEFAULT_SCANNING_FILTER,
    });
    setToast({
      show: true,
      text: t('loadedFromCache', countSnapshotAccounts(cachedScan.snapshots)),
    });
  };

  const onScan = async () => {
    if (state.status !== 'initial') {
      return;
    }
    if (isLocalPreview) {
      const users = _getPreviewUsers();
      const snapshots = buildPreviewSnapshots(users);
      setState({
        status: 'scanning',
        resultsLens: DEFAULT_AUDIT_MODE,
        page: 1,
        searchTerm: '',
        currentTab: 'non_whitelisted',
        percentage: 100,
        isScanningActive: false,
        scanSnapshots: snapshots,
        results: resultsForLens(snapshots, DEFAULT_AUDIT_MODE),
        selectedResults: users.slice(0, 3),
        whitelistedResults: users.slice(10, 12),
        filter: DEFAULT_SCANNING_FILTER,
      });
      return;
    }
    const whitelistedResults = loadWhitelist();
    setState({
      status: 'scanning',
      resultsLens: DEFAULT_AUDIT_MODE,
      page: 1,
      searchTerm: '',
      currentTab: 'non_whitelisted',
      percentage: 0,
      isScanningActive: true,
      scanSnapshots: EMPTY_SCAN_SNAPSHOTS,
      results: [],
      selectedResults: [],
      whitelistedResults,
      filter: DEFAULT_SCANNING_FILTER,
    });
  };

  const handleScanFilter = (e: ChangeEvent<HTMLInputElement>) => {
    if (state.status !== 'scanning') {
      return;
    }
    if (state.selectedResults.length > 0) {
      if (!confirm(t('filterChangeClearsSelection'))) {
        // Force re-render. Bit of a hack but had an issue where the checkbox state was still
        // changing in the UI even even when not confirming. So updating the state fixes this
        // by synchronizing the checkboxes with the filter statuses in the state.
        setState({ ...state });
        return;
      }
    }
    setState({
      ...state,
      // Make sure to clear selected results when changing filter options. This is to avoid having
      // users selected in the unfollow queue but not visible in the UI, which would be confusing.
      selectedResults: [],
      filter: {
        ...state.filter,
        [e.currentTarget.name]: e.currentTarget.checked,
      },
    });
  };

  const handleUnfollowFilter = (e: ChangeEvent<HTMLInputElement>) => {
    if (state.status !== 'unfollowing') {
      return;
    }
    setState({
      ...state,
      filter: {
        ...state.filter,
        [e.currentTarget.name]: e.currentTarget.checked,
      },
    });
  };

  const toggleUser = (newStatus: boolean, user: UserNode) => {
    if (state.status !== 'scanning') {
      return;
    }
    if (newStatus) {
      setState({
        ...state,
        selectedResults: [...state.selectedResults, user],
      });
    } else {
      setState({
        ...state,
        selectedResults: state.selectedResults.filter(result => result.id !== user.id),
      });
    }
  };

  const toggleAllUsers = (e: ChangeEvent<HTMLInputElement>) => {
    if (state.status !== 'scanning') {
      return;
    }
    const displayed = getUsersForDisplay(
      state.results,
      state.whitelistedResults,
      state.currentTab,
      state.searchTerm,
      state.filter,
      state.resultsLens,
    );
    if (e.currentTarget.checked) {
      const currentIds = new Set(state.selectedResults.map(u => u.id));
      const toAdd = displayed.filter(u => !currentIds.has(u.id));
      setState({
        ...state,
        selectedResults: [...state.selectedResults, ...toAdd],
      });
    } else {
      const displayedIds = new Set(displayed.map(u => u.id));
      setState({
        ...state,
        selectedResults: state.selectedResults.filter(u => !displayedIds.has(u.id)),
      });
    }
  };

  // it will work the same as toggleAllUsers, but it will select everyone on the current page.
  const toggleCurrentePageUsers = (e: ChangeEvent<HTMLInputElement>) => {
    if (state.status !== 'scanning') {
      return;
    }
    const pageUsers = getCurrentPageUnfollowers(
      getUsersForDisplay(
        state.results,
        state.whitelistedResults,
        state.currentTab,
        state.searchTerm,
        state.filter,
        state.resultsLens,
      ),
      state.page,
    );
    if (e.currentTarget.checked) {
      const currentIds = new Set(state.selectedResults.map(u => u.id));
      const toAdd = pageUsers.filter(u => !currentIds.has(u.id));
      setState({
        ...state,
        selectedResults: [...state.selectedResults, ...toAdd],
      });
    } else {
      const pageUserIds = new Set(pageUsers.map(u => u.id));
      setState({
        ...state,
        selectedResults: state.selectedResults.filter(u => !pageUserIds.has(u.id)),
      });
    }
  };

  const onWhitelistUpdate = (updatedWhitelist: readonly UserNode[]) => {
    saveWhitelist(updatedWhitelist);
    if (state.status === 'scanning') {
      setState({
        ...state,
        whitelistedResults: updatedWhitelist,
      });
    }
  };

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      // Prompt user if he tries to leave while in the middle of a process (searching / unfollowing / etc..)
      // This is especially good for avoiding accidental tab closing which would result in a frustrating experience.
      if (!isActiveProcess) {
        return;
      }

      // `e` Might be undefined in older browsers, so silence linter for this one.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      e = e || window.event;

      // `e` Might be undefined in older browsers, so silence linter for this one.
      // For IE and Firefox prior to version 4
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (e) {
        e.returnValue = t('beforeUnloadWarning');
      }

      return t('beforeUnloadWarning');
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isActiveProcess, state]);

  useEffect(() => {
    if (state.status !== 'scanning' || isLocalPreview) {
      return;
    }
    if (state.percentage === 100) {
      return;
    }
    const adapter = getActiveAdapter();
    void runAccountScan(adapter, timings, {
      onToast: text => setToast({ show: true, text }),
      onClearToast: () => setToast({ show: false }),
      onFollowersProgress: (followersCount, percentage) => {
        setState(prev =>
          prev.status === 'scanning'
            ? { ...prev, percentage, totalScanned: followersCount }
            : prev,
        );
      },
      onFollowingProgress: (checkedCount, percentage, partialSnapshots) => {
        setState(prev =>
          prev.status === 'scanning'
            ? {
                ...prev,
                scanSnapshots: partialSnapshots,
                results: resultsForLens(partialSnapshots, prev.resultsLens),
                totalScanned: checkedCount,
                percentage,
              }
            : prev,
        );
      },
      onFollowersFailed: () => {
        setState(prev =>
          prev.status === 'scanning'
            ? { ...prev, isScanningActive: false, scanIncomplete: true }
            : prev,
        );
      },
      onFollowingFailedEarly: () => {
        setState(prev =>
          prev.status === 'scanning' ? { ...prev, isScanningActive: false } : prev,
        );
      },
      onComplete: ({ snapshots, checkedCount, scanIsComplete }) => {
        if (scanIsComplete || countSnapshotAccounts(snapshots) > 0) {
          saveCachedScanResults(snapshots);
          setCachedScan({ snapshots, timestamp: Date.now() });
        }
        setState(prev => {
          if (prev.status !== 'scanning') {
            return prev;
          }
          return {
            ...prev,
            percentage: 100,
            scanIncomplete: !scanIsComplete,
            isScanningActive: false,
            scanSnapshots: snapshots,
            results: resultsForLens(snapshots, prev.resultsLens),
            totalScanned: checkedCount,
          };
        });
      },
      isPaused: () => scanningPausedRef.current,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  useEffect(() => {
    if (state.status !== 'unfollowing' || isLocalPreview) {
      return;
    }
    const adapter = getActiveAdapter();
    const queueAction = state.queueAction;
    void runActionQueue(adapter, queueAction, state.selectedResults, timings, {
      onProgress: (entry, percentage) => {
        setState(prev => {
          if (prev.status !== 'unfollowing') {
            return prev;
          }
          return {
            ...prev,
            percentage,
            unfollowLog: [...prev.unfollowLog, entry],
          };
        });
      },
      onActionBlocked: () => {
        setToast({ show: true, text: t('actionBlockedWarning') });
      },
      onSleepToast: text => setToast({ show: true, text }),
      onClearToast: () => setToast({ show: false }),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  let markup: React.JSX.Element;
  switch (state.status) {
    case 'initial':
      markup = (
        <NotSearching
          onScan={onScan}
          cachedScan={cachedScan}
          onLoadCached={onLoadCached}
          cachedAccountCount={cachedScan ? countSnapshotAccounts(cachedScan.snapshots) : 0}
        />
      );
      break;

    case 'scanning': {
      markup = <Searching
        state={state}
        handleScanFilter={handleScanFilter}
        toggleUser={toggleUser}
        pauseScan={pauseScan}
        setState={setState}
        scanningPaused={scanningPaused}
        UserCheckIcon={UserCheckIcon}
        UserUncheckIcon={UserUncheckIcon}
       />;
      break;
    }

    case 'unfollowing':
      markup = <Unfollowing
        state={state}
        handleUnfollowFilter={handleUnfollowFilter}
       />;
      break;

    default:
      assertUnreachable(state);
  }

  const showScanWarning = state.status === 'scanning' && state.results.length === 0;

  return (
    <main id='main' role='main' className={`iu ${showScanWarning ? 'has-scan-warning' : ''}`}>
      <section className='overlay'>
        <Toolbar
          state={state}
          setState={setState}
          isActiveProcess={isActiveProcess}
          toggleAllUsers={toggleAllUsers}
          toggleCurrentePageUsers={toggleCurrentePageUsers}
          setTimings={setTimings}
          currentTimings={timings}
          whitelistedUsers={state.status === 'scanning' ? state.whitelistedResults : loadWhitelist()}
          onWhitelistUpdate={onWhitelistUpdate}
          networkLabel={getActiveAdapter().networkLabel}
         />

        {markup}

        {toast.show && <Toast show={toast.show} message={toast.text} onClose={() => setToast({ show: false })} />}
      </section>
    </main>
  );
}

const resolvedAdapter = resolveAdapter(
  location.hostname,
  isLocalPreview,
  isPreviewX ? 'x' : 'instagram',
);

function mountApp(): void {
  document.body.innerHTML = '';
  render(<App />, document.body);
}

async function bootXApp(): Promise<void> {
  installXApiHeaderCapture();
  persistXBearerFromPage();

  const banner = document.createElement('div');
  banner.textContent = t('xPreparingScan');
  banner.setAttribute(
    'style',
    [
      'position:fixed',
      'inset:0',
      'z-index:2147483646',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'padding:24px',
      'background:rgba(0,0,0,0.55)',
      'color:#fff',
      'font:600 16px/1.4 system-ui,sans-serif',
      'text-align:center',
      'pointer-events:none',
    ].join(';'),
  );
  document.body.appendChild(banner);

  await waitForXApiMirror(14_000);
  banner.remove();
  mountApp();
}

if (!resolvedAdapter) {
  alert(t('hostGuardUnsupported'));
} else {
  setActiveAdapter(resolvedAdapter);
  try {
    resolvedAdapter.assertRuntime();
    document.title = resolvedAdapter.documentTitle;
    if (resolvedAdapter.id === 'x') {
      void bootXApp().catch(() => {
        alert(t('scanFailedXSession'));
      });
    } else {
      mountApp();
    }
  } catch {
    const msg =
      resolvedAdapter.id === 'x'
        ? t('scanFailedXSession')
        : t('hostGuardUnsupported');
    alert(msg);
  }
}
