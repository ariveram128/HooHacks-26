import { createContext, useContext } from 'react';

export const TAB_IDS = ['home', 'learn', 'chat', 'practice', 'account'] as const;
export type TabId = (typeof TAB_IDS)[number];

const TabSwitchContext = createContext<(id: TabId) => void>(() => {});
export const TabSwitchProvider = TabSwitchContext.Provider;
export const useTabSwitch = () => useContext(TabSwitchContext);
