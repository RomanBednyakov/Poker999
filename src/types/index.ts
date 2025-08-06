export type ItemType = {
    name: string;
    balance: number;
    id: string;
}

export type PlayerSessionType = {
    playerId: string;
    playerName: string;
    startBalance: number;
    endBalance: number;
    profit: number; // может быть отрицательным (проигрыш)
    position?: number; // место в турнире (1 = победитель)
    winPercentage?: number; // процент от приза для победителей
}

export type GameSessionType = {
    id: string;
    date: string; // ISO date
    startTime: string;
    endTime: string;
    players: PlayerSessionType[];
    winner?: string; // ID игрока-победителя (устаревшее, используется для совместимости)
    winners?: string[]; // Массив ID победителей
    totalPot: number; // общий банк игры
    gameType: 'poker' | 'tournament';
    description?: string; // дополнительное описание игры
}

export type PlayerStatistics = {
    playerId: string;
    playerName: string;
    totalGames: number;
    totalProfit: number;
    totalLoss: number;
    winRate: number; // процент побед
    avgProfit: number; // средняя прибыль за игру
    bestResult: number;
    worstResult: number;
    lastGameDate?: string;
}