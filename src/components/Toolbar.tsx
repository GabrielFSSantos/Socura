import React, { ChangeEvent, useState } from "react";
import { State } from "../model/state";
import { assertUnreachable, copyListToClipboard, exportToCSV, exportToJSON, getCurrentPageUnfollowers, getUsersForDisplay } from "../utils/utils";
import { SettingMenu } from "./SettingMenu";
import { SettingIcon } from "./icons/SettingIcon";
import { Timings } from "../model/timings";
import { Logo } from "./icons/Logo";
import { UserNode } from "../model/user";
import { t } from "../utils/i18n";

interface ToolBarProps {
  isActiveProcess: boolean;
  state: State;
  setState: (state: State) => void;
  toggleAllUsers: (e: ChangeEvent<HTMLInputElement>) => void;
  toggleCurrentePageUsers: (e: ChangeEvent<HTMLInputElement>) => void;
  currentTimings: Timings;
  setTimings: (timings: Timings) => void;
  whitelistedUsers: readonly UserNode[];
  onWhitelistUpdate: (users: readonly UserNode[]) => void;
}

export const Toolbar = ({
  isActiveProcess,
  state,
  setState,
  toggleAllUsers,
  toggleCurrentePageUsers,
  currentTimings,
  setTimings,
  whitelistedUsers,
  onWhitelistUpdate,
}: ToolBarProps) => {

  const [settingMenu, setSettingMenu] = useState(false);

  return (
    <header className="app-header">
      {state.status === "scanning" && state.results.length === 0 && (
        <div className="scan-warning-banner" role="status">
          <span>{t("scanNoticeBanner")}</span>
        </div>
      )}
      {isActiveProcess && (
        <div
          className="progressbar"
          style={{ '--progress-width': `${state.status !== 'initial' ? state.percentage : 0}%` } as React.CSSProperties}
        />
      )}
      <div className="app-header-content">
        <div
          className="logo"
          onClick={() => {
            if (isActiveProcess) {
              return;
            }
            switch (state.status) {
              case "initial":
                if (confirm(t("goBackConfirm"))) {
                  location.reload();
                }
                break;

              case "scanning":
              case "unfollowing":
                setState({
                  status: "initial",
                });
            }
          }}
        >
          <Logo />
          <div className="logo-text">
            <span>Social Unfollowers</span>
            <span>Instagram</span>
          </div>
        </div>
        <div className="toolbar-actions">
          <button
            className="copy-list"
            onClick={() => {
              switch (state.status) {
                case "scanning":
                  return copyListToClipboard(
                    getUsersForDisplay(
                      state.results,
                      state.whitelistedResults,
                      state.currentTab,
                      state.searchTerm,
                      state.filter,
                    ),
                    t("copiedToClipboard")
                  );
                case "initial":
                case "unfollowing":
                  return;
                default:
                  assertUnreachable(state);
              }
            }}
            disabled={state.status === "initial"}
          >
            {t("copyList")}
          </button>
          <button
            className="copy-list"
            title={t("exportJson")}
            onClick={() => {
              if (state.status === "scanning") {
                exportToJSON(getUsersForDisplay(state.results, state.whitelistedResults, state.currentTab, state.searchTerm, state.filter));
              }
            }}
            disabled={state.status !== "scanning"}
          >
            JSON
          </button>
          <button
            className="copy-list"
            title={t("exportCsv")}
            onClick={() => {
              if (state.status === "scanning") {
                exportToCSV(getUsersForDisplay(state.results, state.whitelistedResults, state.currentTab, state.searchTerm, state.filter));
              }
            }}
            disabled={state.status !== "scanning"}
          >
            CSV
          </button>
          <button
            className="icon-button"
            type="button"
            title={t("settings")}
            onClick={() => { setSettingMenu(true); }}
          >
            <SettingIcon />
          </button>
        </div>
        <div className="toolbar-search">
          <input
            type="text"
            className="search-bar"
            placeholder={t("searchPlaceholder")}
            disabled={state.status === "initial"}
            value={state.status === "initial" ? "" : state.searchTerm}
            onChange={e => {
              switch (state.status) {
                case "initial":
                  return;
                case "scanning":
                  return setState({
                    ...state,
                    searchTerm: e.currentTarget.value,
                  });
                case "unfollowing":
                  return setState({
                    ...state,
                    searchTerm: e.currentTarget.value,
                  });
                default:
                  assertUnreachable(state);
              }
            }}
          />
          {state.status === "scanning" && (
            <label className="select-toggle">
              <input
                title={t("selectPage")}
                type="checkbox"
                disabled={Boolean(state.isScanningActive)}
                checked={
                  (() => {
                    const displayed = getUsersForDisplay(state.results, state.whitelistedResults, state.currentTab, state.searchTerm, state.filter);
                    const pageUsers = getCurrentPageUnfollowers(displayed, state.page);
                    return pageUsers.length > 0 && pageUsers.every(u => state.selectedResults.some(s => s.id === u.id));
                  })()
                }
                className="toggle-all-checkbox"
                onChange={toggleCurrentePageUsers}
              />
              {t("selectPage")}
            </label>
          )}
          {state.status === "scanning" && (
            <label className="select-toggle">
              <input
                title={t("selectAll")}
                type="checkbox"
                disabled={Boolean(state.isScanningActive)}
                checked={
                  (() => {
                    const displayed = getUsersForDisplay(
                      state.results,
                      state.whitelistedResults,
                      state.currentTab,
                      state.searchTerm,
                      state.filter,
                    );
                    return displayed.length > 0 && displayed.every(u => state.selectedResults.some(s => s.id === u.id));
                  })()
                }
                className="toggle-all-checkbox"
                onChange={toggleAllUsers}
              />
              {t("selectAll")}
            </label>
          )}
        </div>
      </div>
      {settingMenu && (
        <SettingMenu
          setSettingState={setSettingMenu}
          currentTimings={currentTimings}
          setTimings={setTimings}
          whitelistedUsers={whitelistedUsers}
          onWhitelistUpdate={onWhitelistUpdate}
        />
      )}

    </header>
  );
};
