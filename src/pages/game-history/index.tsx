import React, { useState, useEffect } from 'react';
import { GameSessionService } from '../../utils/gameSession';
import { GameSessionType } from '../../types';
import styles from './style.module.css';

const GameHistoryPage: React.FC = () => {
    const [sessions, setSessions] = useState<GameSessionType[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState<GameSessionType | null>(null);

    useEffect(() => {
        loadGameSessions();
    }, []);

    const loadGameSessions = async () => {
        try {
            setLoading(true);
            const gameSessions = await GameSessionService.getAllGameSessions();
            setSessions(gameSessions);
        } catch (error) {
            console.error('Error loading game sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPositionEmoji = (position: number) => {
        switch (position) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `${position}`;
        }
    };

    const closeModal = () => {
        setSelectedSession(null);
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Загрузка истории игр...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>📚 История игр</h1>
            
            {sessions.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🎮</div>
                    <h3>Пока нет завершенных игр</h3>
                    <p>Начните первую игру, чтобы увидеть результаты здесь!</p>
                </div>
            ) : (
                <div className={styles.sessionsList}>
                    {sessions
                        .sort((a, b) => {
                            // Сортировка по дате и времени в убывающем порядке (новые сверху)
                            const dateA = new Date(`${a.date}T${a.startTime}`);
                            const dateB = new Date(`${b.date}T${b.startTime}`);
                            return dateB.getTime() - dateA.getTime();
                        })
                        .map((session) => {
                        // Поддержка как старого формата (один победитель), так и нового (несколько)
                        const winners = session.winners || (session.winner ? [session.winner] : []);
                        const winnerPlayers = session.players.filter(p => winners.includes(p.playerId));
                        const totalPlayers = session.players.length;
                        
                        return (
                            <div 
                                key={session.id} 
                                className={styles.sessionCard}
                                onClick={() => setSelectedSession(session)}
                            >
                                <div className={styles.sessionHeader}>
                                    <div className={styles.sessionDate}>
                                        📅 {formatDate(session.date)}
                                    </div>
                                    <div className={styles.sessionTime}>
                                        ⏰ {formatTime(session.startTime)}
                                    </div>
                                </div>
                                
                                <div className={styles.sessionInfo}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}>Игроки:</span>
                                        <span className={styles.value}>{totalPlayers}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}>Банк:</span>
                                        <span className={styles.value}>{session.totalPot}$</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}>
                                            {winnerPlayers.length > 1 ? 'Победители:' : 'Победитель:'}
                                        </span>
                                        <span className={styles.winner}>
                                            🏆 {winnerPlayers.length > 0 
                                                ? winnerPlayers.map(w => w.playerName + (w.winPercentage ? ` (${w.winPercentage}%)` : '')).join(', ')
                                                : 'Неизвестен'
                                            }
                                        </span>
                                    </div>
                                </div>
                                
                                <div className={styles.viewDetails}>
                                    👁️ Подробности
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal for session details */}
            {selectedSession && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>🎮 Детали игры</h2>
                            <button className={styles.closeButton} onClick={closeModal}>
                                ✕
                            </button>
                        </div>
                        
                        <div className={styles.modalContent}>
                            <div className={styles.gameInfo}>
                                <div className={styles.infoRow}>
                                    <strong>Дата:</strong> {formatDate(selectedSession.date)}
                                </div>
                                <div className={styles.infoRow}>
                                    <strong>Время:</strong> {formatTime(selectedSession.startTime)} - {formatTime(selectedSession.endTime)}
                                </div>
                                <div className={styles.infoRow}>
                                    <strong>Общий банк:</strong> {selectedSession.totalPot}$
                                </div>
                                <div className={styles.infoRow}>
                                    <strong>Тип игры:</strong> {selectedSession.gameType === 'poker' ? 'Покер' : 'Турнир'}
                                </div>
                            </div>
                            
                            <h3 className={styles.playersTitle}>👥 Результаты игроков</h3>
                            <div className={styles.playersList}>
                                {selectedSession.players
                                    .sort((a, b) => (a.position || 999) - (b.position || 999))
                                    .map((player) => (
                                    <div key={player.playerId} className={styles.playerResult}>
                                        <div className={styles.playerPosition}>
                                            {getPositionEmoji(player.position || 0)}
                                        </div>
                                        <div className={styles.playerInfo}>
                                            <div className={styles.playerName}>
                                                {player.playerName}
                                            </div>
                                            <div className={styles.playerBalances}>
                                                {player.startBalance}$ → {player.endBalance}$
                                            </div>
                                        </div>
                                        <div className={`${styles.playerProfit} ${
                                            (() => {
                                                const actualProfit = player.endBalance - player.startBalance;
                                                return actualProfit >= 0 ? styles.positive : styles.negative;
                                            })()
                                        }`}>
                                            {(() => {
                                                const actualProfit = player.endBalance - player.startBalance;
                                                return `${actualProfit >= 0 ? '+' : ''}${actualProfit}$`;
                                            })()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameHistoryPage;