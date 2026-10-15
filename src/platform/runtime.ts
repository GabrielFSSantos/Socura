import { SocialPlatformAdapter } from './types';

let activeAdapter: SocialPlatformAdapter | null = null;

export function setActiveAdapter(adapter: SocialPlatformAdapter): void {
  activeAdapter = adapter;
}

export function getActiveAdapter(): SocialPlatformAdapter {
  if (!activeAdapter) {
    throw new Error('Platform adapter not initialized');
  }
  return activeAdapter;
}
