import {ItemType} from '../types'

export const DEFAULT_LIST: ItemType[] = [{
    name: 'Царь',
    balance: 200,
    id: "id" + Math.random().toString(16).slice(2)
},
    {
        name: 'Семен',
        balance: 200,
        id: "id" + Math.random().toString(16).slice(2)
    },
    {
        name: 'Зорг',
        balance: 200,
        id: "id" + Math.random().toString(16).slice(2)
    },
    {
        name: 'Леха',
        balance: 200,
        id: "id" + Math.random().toString(16).slice(2)
    },
    {
        name: 'Тон',
        balance: 200,
        id: "id" + Math.random().toString(16).slice(2)
    },
    {
        name: 'Пира',
        balance: 200,
        id: "id" + Math.random().toString(16).slice(2)
    },
]

export const DEFAULT_ITEM: ItemType = {
    name: '',
    balance: 200,
    id: "id" + Math.random().toString(16).slice(2)
}

export const DEFAULT_LIST_NAME: string[] = ['Царь', 'Семен', 'Зорг', 'Леха', 'Тон', 'Пира']

export const LIST_PAGES: any = {
    DASHBOARD: 'DASHBOARD',
    HOME: 'HOME',
    APP: 'APP',
    Trading: 'Trading',
    TradingMartin: 'TradingMartin',
    GAME_HISTORY: 'GAME_HISTORY',
    STATISTICS: 'STATISTICS',
}

export const DEFAULT_BALANCE: number = 200
