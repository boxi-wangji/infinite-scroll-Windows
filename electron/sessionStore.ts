import Store from 'electron-store'
import { SessionData, PanelModel } from '../src/types/models'

interface StoreSchema {
  panels: PanelModel[]
  fontSize: number
  sessions: Record<string, SessionData>
}

const store = new Store<StoreSchema>({
  name: 'infinite-scroll-state',
  defaults: {
    panels: [],
    fontSize: 13,
    sessions: {},
  },
})

export const sessionStore = {
  getPanels: (): PanelModel[] => store.get('panels'),
  setPanels: (panels: PanelModel[]): void => store.set('panels', panels),

  getFontSize: (): number => store.get('fontSize'),
  setFontSize: (size: number): void => store.set('fontSize', size),

  getSessions: (): Record<string, SessionData> => store.get('sessions'),

  saveSession: (data: SessionData): void => {
    const sessions = store.get('sessions')
    sessions[data.cellId] = data
    store.set('sessions', sessions)
  },

  clearSession: (cellId: string): void => {
    const sessions = store.get('sessions')
    delete sessions[cellId]
    store.set('sessions', sessions)
  },

  saveLayout: (panels: PanelModel[], fontSize: number): void => {
    store.set('panels', panels)
    store.set('fontSize', fontSize)
  },
}
