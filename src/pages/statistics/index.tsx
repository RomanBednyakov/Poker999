import React, { useState, useEffect } from 'react';
import { GameSessionService } from '../../utils/gameSession';
import { GameSessionType, PlayerStatistics } from '../../types';
import styles from './style.module.css';

const StatisticsPage: React.FC = () => {
    const [sessions, setSessions] = useState<GameSessionType[]>([]);
    const [playerStats, setPlayerStats] = useState<PlayerStatistics[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState({
        startDate: '',
        endDate: ''
    });
    const [filteredSessions, setFilteredSessions] = useState<GameSessionType[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterSessionsByDate();
    }, [sessions, dateFilter]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [gameSessions, topPlayers] = await Promise.all([
                GameSessionService.getAllGameSessions(),
                GameSessionService.getTopPlayers(20)
            ]);
            setSessions(gameSessions);
            setPlayerStats(topPlayers);
        } catch (error) {
            console.error('Error loading statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterSessionsByDate = () => {
        if (!dateFilter.startDate && !dateFilter.endDate) {
            setFilteredSessions(sessions);
            return;
        }

        const filtered = sessions.filter(session => {
            const sessionDate = new Date(session.date);
            const start = dateFilter.startDate ? new Date(dateFilter.startDate) : new Date('1900-01-01');
            const end = dateFilter.endDate ? new Date(dateFilter.endDate) : new Date('2100-12-31');
            return sessionDate >= start && sessionDate <= end;
        });

        setFilteredSessions(filtered);
    };

    const calculateFilteredStats = () => {
        if (filteredSessions.length === 0) return [];

        const playerMap = new Map<string, {
            playerId: string;
            playerName: string;
            games: number;
            totalProfit: number;
            totalLoss: number;
            wins: number;
            results: number[];
        }>();

        filteredSessions.forEach(session => {
            session.players.forEach(player => {
                const existing = playerMap.get(player.playerId) || {
                    playerId: player.playerId,
                    playerName: player.playerName,
                    games: 0,
                    totalProfit: 0,
                    totalLoss: 0,
                    wins: 0,
                    results: []
                };

                existing.games++;
                // Вычисляем актуальную прибыль из startBalance и endBalance
                const actualProfit = player.endBalance - player.startBalance;
                existing.results.push(actualProfit);
                
                if (actualProfit > 0) {
                    existing.totalProfit += actualProfit;
                    existing.wins++;
                } else {
                    existing.totalLoss += Math.abs(actualProfit);
                }

                playerMap.set(player.playerId, existing);
            });
        });

        return Array.from(playerMap.values())
            .map(p => ({
                playerId: p.playerId,
                playerName: p.playerName,
                totalGames: p.games,
                totalProfit: p.totalProfit,
                totalLoss: p.totalLoss,
                winRate: (p.wins / p.games) * 100,
                avgProfit: p.results.reduce((sum, r) => sum + r, 0) / p.results.length,
                bestResult: Math.max(...p.results),
                worstResult: Math.min(...p.results),
                netProfit: p.totalProfit - p.totalLoss
            }))
            .sort((a, b) => b.netProfit - a.netProfit);
    };

    const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
        setDateFilter(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const clearDateFilter = () => {
        setDateFilter({ startDate: '', endDate: '' });
    };

    const formatCurrency = (amount: number) => {
        return `${amount >= 0 ? '+' : ''}${amount}$`;
    };

    const getCurrentYearData = () => {
        const currentYear = new Date().getFullYear();
        const yearStart = `${currentYear}-01-01`;
        const yearEnd = `${currentYear}-12-31`;
        
        return sessions.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= new Date(yearStart) && sessionDate <= new Date(yearEnd);
        });
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Загрузка статистики...</p>
                </div>
            </div>
        );
    }

    const displayedStats = dateFilter.startDate || dateFilter.endDate 
        ? calculateFilteredStats() 
        : playerStats.map(p => ({ ...p, netProfit: p.totalProfit - p.totalLoss }));

    const currentYearSessions = getCurrentYearData();

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>📊 Статистика игроков</h1>
            
            {/* Date Filter */}
            <div className={styles.filterSection}>
                <h3 className={styles.filterTitle}>🗓️ Фильтр по дате</h3>
                <div className={styles.dateFilter}>
                    <div className={styles.dateInput}>
                        <label>От:</label>
                        <input
                            type="date"
                            value={dateFilter.startDate}
                            onChange={(e) => handleDateChange('startDate', e.target.value)}
                            className={styles.input}
                            aria-label="Дата начала периода"
                        />
                    </div>
                    <div className={styles.dateInput}>
                        <label>До:</label>
                        <input
                            type="date"
                            value={dateFilter.endDate}
                            onChange={(e) => handleDateChange('endDate', e.target.value)}
                            className={styles.input}
                            aria-label="Дата окончания периода"
                        />
                    </div>
                    {(dateFilter.startDate || dateFilter.endDate) && (
                        <button 
                            onClick={clearDateFilter}
                            className={styles.clearButton}
                        >
                            ✕ Очистить
                        </button>
                    )}
                </div>
            </div>

            {/* Overall Stats */}
            <div className={styles.overallStats}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🎮</div>
                    <div className={styles.statValue}>{filteredSessions.length}</div>
                    <div className={styles.statLabel}>
                        {dateFilter.startDate || dateFilter.endDate ? 'Игр в периоде' : 'Всего игр'}
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>📅</div>
                    <div className={styles.statValue}>{currentYearSessions.length}</div>
                    <div className={styles.statLabel}>Игр в этом году</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>👥</div>
                    <div className={styles.statValue}>{displayedStats.length}</div>
                    <div className={styles.statLabel}>Активных игроков</div>
                </div>
            </div>

            {/* Players Statistics */}
            {displayedStats.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📈</div>
                    <h3>Нет данных за выбранный период</h3>
                    <p>Выберите другой период или сыграйте больше игр!</p>
                </div>
            ) : (
                <div className={styles.statsTable}>
                    <h3 className={styles.tableTitle}>
                        🏆 Рейтинг игроков 
                        {(dateFilter.startDate || dateFilter.endDate) && ' (за период)'}
                    </h3>
                    
                    {/* Full Table with Mobile Scroll */}
                    <div className={styles.statsTable}>
                        <div className={styles.tableHeader}>
                            <div className={styles.rank}>#</div>
                            <div className={styles.playerName}>Игрок</div>
                            <div className={styles.games}>Игр</div>
                            <div className={styles.winRate}>% побед</div>
                            <div className={styles.profit}>Прибыль</div>
                            <div className={styles.avgProfit}>Среднее</div>
                        </div>
                        
                        <div className={styles.tableBody}>
                            {displayedStats.map((player, index) => (
                                <div key={player.playerId} className={styles.tableRow}>
                                    <div className={styles.rank}>
                                        {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                                    </div>
                                    <div className={styles.playerName}>
                                        {player.playerName}
                                    </div>
                                    <div className={styles.games}>
                                        {player.totalGames}
                                    </div>
                                    <div className={styles.winRate}>
                                        {player.winRate.toFixed(1)}%
                                    </div>
                                    <div className={`${styles.profit} ${
                                        player.netProfit >= 0 ? styles.positive : styles.negative
                                    }`}>
                                        {formatCurrency(player.netProfit)}
                                    </div>
                                    <div className={`${styles.avgProfit} ${
                                        player.avgProfit >= 0 ? styles.positive : styles.negative
                                    }`}>
                                        {formatCurrency(Math.round(player.avgProfit))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Stats */}
            {displayedStats.length > 0 && (
                <div className={styles.detailedStats}>
                    <h3 className={styles.detailedTitle}>📋 Подробная статистика</h3>
                    <div className={styles.detailedList}>
                        {displayedStats.map((player) => (
                            <div key={player.playerId} className={styles.detailedCard}>
                                <div className={styles.cardHeader}>
                                    <h4>{player.playerName}</h4>
                                    <div className={`${styles.cardProfit} ${
                                        player.netProfit >= 0 ? styles.positive : styles.negative
                                    }`}>
                                        {formatCurrency(player.netProfit)}
                                    </div>
                                </div>
                                
                                <div className={styles.cardStats}>
                                    <div className={styles.cardStat}>
                                        <span className={styles.cardLabel}>Игр:</span>
                                        <span>{player.totalGames}</span>
                                    </div>
                                    <div className={styles.cardStat}>
                                        <span className={styles.cardLabel}>Процент побед:</span>
                                        <span>{player.winRate.toFixed(1)}%</span>
                                    </div>
                                    <div className={styles.cardStat}>
                                        <span className={styles.cardLabel}>Выиграно:</span>
                                        <span className={styles.positive}>+{player.totalProfit}$</span>
                                    </div>
                                    <div className={styles.cardStat}>
                                        <span className={styles.cardLabel}>Проиграно:</span>
                                        <span className={styles.negative}>-{player.totalLoss}$</span>
                                    </div>
                                    <div className={styles.cardStat}>
                                        <span className={styles.cardLabel}>Лучший результат:</span>
                                        <span className={styles.positive}>+{player.bestResult}$</span>
                                    </div>
                                    <div className={styles.cardStat}>
                                        <span className={styles.cardLabel}>Худший результат:</span>
                                        <span className={styles.negative}>{player.worstResult}$</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatisticsPage;