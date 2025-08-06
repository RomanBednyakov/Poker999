import { DB } from '../base';
import { GameSessionType, PlayerSessionType, ItemType, PlayerStatistics } from '../types';

type WinnerInfo = {
    playerId: string;
    percentage: number;
}

export class GameSessionService {
    // Сохранить игровую сессию
    static async saveGameSession(session: GameSessionType): Promise<void> {
        try {
            const sessionRef = DB.ref(`gameSessions/${session.id}`);
            await sessionRef.set(JSON.stringify(session));
        } catch (error) {
            console.error('Error saving game session:', error);
            throw error;
        }
    }

    // Получить все игровые сессии
    static async getAllGameSessions(): Promise<GameSessionType[]> {
        try {
            const sessionsRef = DB.ref('gameSessions');
            const snapshot = await sessionsRef.once('value');
            const sessionsData = snapshot.val() || {};
            
            return Object.values(sessionsData)
                .map((sessionStr: any) => JSON.parse(sessionStr))
                .sort((a: GameSessionType, b: GameSessionType) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );
        } catch (error) {
            console.error('Error fetching game sessions:', error);
            return [];
        }
    }

    // Очистить все игровые сессии из базы данных
    static async clearAllGameSessions(): Promise<void> {
        try {
            const sessionsRef = DB.ref('gameSessions');
            await sessionsRef.remove();
            console.log('✅ All game sessions cleared from database');
        } catch (error) {
            console.error('❌ Error clearing game sessions:', error);
            throw error;
        }
    }

    // Получить сессии за определенный период
    static async getSessionsByDateRange(startDate: string, endDate: string): Promise<GameSessionType[]> {
        const allSessions = await this.getAllGameSessions();
        return allSessions.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= new Date(startDate) && sessionDate <= new Date(endDate);
        });
    }

    // Создать игровую сессию с выбранными победителями
    static createGameSessionWithWinners(
        players: ItemType[], 
        startBalances: Record<string, number>,
        winners: WinnerInfo[],
        gameType: 'poker' | 'tournament' = 'poker'
    ): GameSessionType {
        const now = new Date();
        const sessionId = `session_${now.getTime()}_${Math.random().toString(16).slice(2)}`;
        
        const playerSessions: PlayerSessionType[] = players.map(player => {
            const winnerInfo = winners.find(w => w.playerId === player.id);
            const isWinner = !!winnerInfo;
            const startBalance = startBalances[player.id];
            const endBalance = player.balance;
            
            // Проверяем наличие стартового баланса
            if (!startBalance && startBalance !== 0) {
                console.warn(`⚠️ Missing start balance for player ${player.name}, using current balance`);
            }
            
            return {
                playerId: player.id,
                playerName: player.name,
                startBalance: startBalance || endBalance,
                endBalance: endBalance,
                profit: endBalance - (startBalance || endBalance),
                position: isWinner ? 1 : undefined, // Все победители получают 1 место
                winPercentage: winnerInfo?.percentage || 0, // Новое поле для процента приза
            };
        });

        // Устанавливаем позиции для не-победителей
        const nonWinners = playerSessions.filter(p => !p.position);
        nonWinners.sort((a, b) => b.profit - a.profit);
        nonWinners.forEach((player, index) => {
            player.position = index + 2; // Начинаем с 2 места
        });

        const totalPot = playerSessions.reduce((sum, player) => sum + player.endBalance, 0);

        return {
            id: sessionId,
            date: now.toISOString().split('T')[0],
            startTime: now.toISOString(),
            endTime: now.toISOString(),
            players: playerSessions,
            winners: winners.map(w => w.playerId), // Массив ID победителей
            totalPot,
            gameType,
        };
    }

    // Создать игровую сессию из текущих игроков (старый метод для совместимости)
    static createGameSession(
        players: ItemType[], 
        startBalances: Record<string, number>,
        gameType: 'poker' | 'tournament' = 'poker'
    ): GameSessionType {
        const now = new Date();
        const sessionId = `session_${now.getTime()}_${Math.random().toString(16).slice(2)}`;
        
        const playerSessions: PlayerSessionType[] = players.map(player => ({
            playerId: player.id,
            playerName: player.name,
            startBalance: startBalances[player.id] || player.balance,
            endBalance: player.balance,
            profit: player.balance - (startBalances[player.id] || player.balance),
        }));

        // Определяем победителя (игрок с наибольшей прибылью)
        const winner = playerSessions.reduce((prev, current) => 
            prev.profit > current.profit ? prev : current
        );

        // Устанавливаем позиции игроков
        const sortedByProfit = [...playerSessions].sort((a, b) => b.profit - a.profit);
        sortedByProfit.forEach((player, index) => {
            player.position = index + 1;
        });

        const totalPot = playerSessions.reduce((sum, player) => sum + player.endBalance, 0);

        return {
            id: sessionId,
            date: now.toISOString().split('T')[0], // YYYY-MM-DD
            startTime: now.toISOString(),
            endTime: now.toISOString(),
            players: playerSessions,
            winner: winner.playerId,
            totalPot,
            gameType,
        };
    }

    // Рассчитать статистику игрока
    static async calculatePlayerStatistics(playerId: string): Promise<PlayerStatistics | null> {
        const allSessions = await this.getAllGameSessions();
        const playerSessions = allSessions.filter(session => 
            session.players.some(p => p.playerId === playerId)
        );

        if (playerSessions.length === 0) {
            return null;
        }

        const playerName = playerSessions[0].players.find(p => p.playerId === playerId)?.playerName || '';
        const results = playerSessions.map(session => 
            session.players.find(p => p.playerId === playerId)!
        );

        // Вычисляем актуальную прибыль из startBalance и endBalance
        const totalProfit = results.reduce((sum, p) => {
            const actualProfit = p.endBalance - p.startBalance;
            return sum + Math.max(0, actualProfit);
        }, 0);
        const totalLoss = results.reduce((sum, p) => {
            const actualProfit = p.endBalance - p.startBalance;
            return sum + Math.abs(Math.min(0, actualProfit));
        }, 0);
        
        // Правильный подсчет побед: проверяем массив winners или старое поле winner
        const wins = playerSessions.filter(session => {
            // Новый формат: проверяем массив winners
            if (session.winners && session.winners.length > 0) {
                return session.winners.includes(playerId);
            }
            // Старый формат: проверяем поле winner
            if (session.winner) {
                return session.winner === playerId;
            }
            // Если нет информации о победителе, считаем по позиции
            const playerData = session.players.find(p => p.playerId === playerId);
            return playerData?.position === 1;
        }).length;
        
        // Вычисляем актуальные прибыли
        const actualProfits = results.map(p => p.endBalance - p.startBalance);

        return {
            playerId,
            playerName,
            totalGames: playerSessions.length,
            totalProfit,
            totalLoss,
            winRate: (wins / playerSessions.length) * 100,
            avgProfit: actualProfits.reduce((sum, p) => sum + p, 0) / actualProfits.length,
            bestResult: Math.max(...actualProfits),
            worstResult: Math.min(...actualProfits),
            lastGameDate: playerSessions[0]?.date,
        };
    }

    // Получить топ игроков по прибыли
    static async getTopPlayers(limit: number = 10): Promise<PlayerStatistics[]> {
        const allSessions = await this.getAllGameSessions();
        const playerIds = new Set<string>();
        
        allSessions.forEach(session => {
            session.players.forEach(player => {
                playerIds.add(player.playerId);
            });
        });

        const statistics: PlayerStatistics[] = [];
        for (const playerId of Array.from(playerIds)) {
            const stats = await this.calculatePlayerStatistics(playerId);
            if (stats) {
                statistics.push(stats);
            }
        }

        return statistics
            .sort((a, b) => (b.totalProfit - b.totalLoss) - (a.totalProfit - a.totalLoss))
            .slice(0, limit);
    }
}