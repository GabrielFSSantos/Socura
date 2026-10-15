import React, { useState } from 'react';
import { Timings } from '../model/timings';
import { UserNode } from '../model/user';
import { WhitelistManager } from './WhitelistManager';
import { DEFAULT_USERS_PER_SEARCH_CYCLE } from '../constants/constants';
import { t } from '../utils/i18n';

interface SettingMenuProps {
  setSettingState: (state: boolean) => void;
  currentTimings: Timings;
  setTimings: (timings: Timings) => void;
  whitelistedUsers: readonly UserNode[];
  onWhitelistUpdate: (users: readonly UserNode[]) => void;
}

export const SettingMenu = ({
  setSettingState,
  currentTimings,
  setTimings,
  whitelistedUsers,
  onWhitelistUpdate,
}: SettingMenuProps) => {
  const [timeBetweenSearchCycles, setTimeBetweenSearchCycles] = useState(currentTimings.timeBetweenSearchCycles);
  const [timeToWaitAfterFiveSearchCycles, setTimeToWaitAfterFiveSearchCycles] = useState(currentTimings.timeToWaitAfterFiveSearchCycles);
  const [timeBetweenUnfollows, setTimeBetweenUnfollows] = useState(currentTimings.timeBetweenUnfollows);
  const [timeToWaitAfterFiveUnfollows, setTimeToWaitAfterFiveUnfollows] = useState(currentTimings.timeToWaitAfterFiveUnfollows);
  const [usersPerSearchCycle, setUsersPerSearchCycle] = useState(currentTimings.usersPerSearchCycle ?? DEFAULT_USERS_PER_SEARCH_CYCLE);

  const handleSave = (event: any) => {
    event.preventDefault();
    setTimings({
      timeBetweenSearchCycles,
      timeToWaitAfterFiveSearchCycles,
      timeBetweenUnfollows,
      timeToWaitAfterFiveUnfollows,
      usersPerSearchCycle,
    });
    setSettingState(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, setter: (value: number) => void) => {
    const value = Math.max(0, Number(event.currentTarget.value));
    setter(value);
  };

  return (
    <form onSubmit={handleSave}>
      <div className='backdrop'>
        <div className='setting-menu'>
          {/* Settings Module */}
          <div className='settings-module'>
            <div className='module-header'>
              <h3>{t('settingsTitle')}</h3>
            </div>

            <div className='settings-content'>
              <div className='row'>
                <label className='minimun-width'>{t('timeBetweenSearchCycles')}</label>
                <input
                  type='number'
                  id='searchCycles'
                  name='searchCycles'
                  min={500}
                  max={999999}
                  value={timeBetweenSearchCycles}
                  onChange={e => handleInputChange(e, setTimeBetweenSearchCycles)}
                />
                <label className='margin-between-input-and-label'>(ms)</label>
              </div>

              <div className='row'>
                <label className='minimun-width'>{t('timeToWaitAfterFiveCycles')}</label>
                <input
                  type='number'
                  id='fiveSearchCycles'
                  name='fiveSearchCycles'
                  min={4000}
                  max={999999}
                  value={timeToWaitAfterFiveSearchCycles}
                  onChange={e => handleInputChange(e, setTimeToWaitAfterFiveSearchCycles)}
                />
                <label className='margin-between-input-and-label'>(ms)</label>
              </div>

              <div className='row'>
                <label className='minimun-width'>{t('timeBetweenUnfollows')}</label>
                <input
                  type='number'
                  id='timeBetweenUnfollow'
                  name='timeBetweenUnfollow'
                  min={1000}
                  max={999999}
                  value={timeBetweenUnfollows}
                  onChange={e => handleInputChange(e, setTimeBetweenUnfollows)}
                />
                <label className='margin-between-input-and-label'>(ms)</label>
              </div>

              <div className='row'>
                <label className='minimun-width'>{t('timeToWaitAfterFiveUnfollows')}</label>
                <input
                  type='number'
                  id='timeAfterFiveUnfollows'
                  name='timeAfterFiveUnfollows'
                  min={70000}
                  max={999999}
                  value={timeToWaitAfterFiveUnfollows}
                  onChange={e => handleInputChange(e, setTimeToWaitAfterFiveUnfollows)}
                />
                <label className='margin-between-input-and-label'>(ms)</label>
              </div>

              <div className='row'>
                <label className='minimun-width'>{t('usersPerSearchCycle')}</label>
                <input
                  type='number'
                  id='usersPerSearchCycle'
                  name='usersPerSearchCycle'
                  min={1}
                  max={200}
                  value={usersPerSearchCycle}
                  onChange={e => handleInputChange(e, setUsersPerSearchCycle)}
                />
                <label className='margin-between-input-and-label'>(users)</label>
              </div>

              <div className='warning-container'>
                <h3 className='warning'><b>{t('warningPrefix')}</b> {t('settingsWarning1')}</h3>
                <h3 className='warning'>{t('settingsWarning2')}</h3>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className='module-divider' />

          {/* Whitelist Management Module */}
          <div className='whitelist-module'>
            <WhitelistManager
              whitelistedUsers={whitelistedUsers}
              onWhitelistUpdate={onWhitelistUpdate}
            />
          </div>

          {/* Action Buttons */}
          <div className='btn-container'>
            <button className='btn' type='button' onClick={() => setSettingState(false)}>
              {t('cancel')}
            </button>
            <button className='btn' type='submit'>
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
