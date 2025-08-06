import React, {useState, useRef} from 'react';

import {DEFAULT_ITEM, LIST_PAGES} from '../../moks';
import {ItemType} from "../../types";
import DeleteIcon from "../../img/delete.png";
import { GameSessionService } from '../../utils/gameSession';
import { toast, ToastContainer } from 'react-toastify';


import styles from './style.module.css';

type DashboardType = {
    setActivePage: (state: string) => void;
    setList: (list: ItemType[]) => void;
    list: ItemType[];
    defaultBalance: number;
    isAdmin: boolean;
}

const AppPage: React.FC<DashboardType> = ({setActivePage, list, setList, defaultBalance, isAdmin}) => {
    const [value, setValue] = useState('')
    const [gameStarted, setGameStarted] = useState(false)
    const [isEndingGame, setIsEndingGame] = useState(false)
    const [showWinnerModal, setShowWinnerModal] = useState(false)
    const [selectedWinners, setSelectedWinners] = useState<Array<{playerId: string, percentage: number}>>([])
    const startBalancesRef = useRef<Record<string, number>>({})

    const handleRefresh = () => {
        setActivePage(LIST_PAGES.HOME)
    }

    const handleClearDatabase = async () => {
        const confirmClear = window.confirm('⚠️ ВНИМАНИЕ! Это удалит ВСЮ историю игр и статистику!\n\nВы уверены?');
        if (!confirmClear) return;
        
        const confirmAgain = window.confirm('🚨 ПОСЛЕДНЕЕ ПРЕДУПРЕЖДЕНИЕ!\n\nЭто действие НЕОБРАТИМО!\nВся история игр будет ПОЛНОСТЬЮ УДАЛЕНА!\n\nПродолжить?');
        if (!confirmAgain) return;

        try {
            await GameSessionService.clearAllGameSessions();
            toast.success('✅ База данных очищена!', { position: 'top-center' });
        } catch (error) {
            toast.error('❌ Ошибка при очистке базы данных!', { position: 'top-center' });
            console.error('Clear database error:', error);
        }
    }

    const handleChangeName = (event: any) => {
        setValue(event.target.value)
    }

    const handleSave = () => {
        setList([...list, {...DEFAULT_ITEM, name: value, balance: defaultBalance, id: "id" + Math.random().toString(16).slice(2)}])
        setValue('')
    }
    const setBalance = (balance: number, id: string) => {
        setList(list.map(item => (item.id === id ? {...item, balance} : item)))
    }

    const deleteUser = (id: string) => {
        setList(list.filter(item => (item.id !== id)))
    }

    const handleStartGame = () => {
        // Сохраняем начальные балансы всех игроков
        const startBalances: Record<string, number> = {};
        list.forEach(player => {
            startBalances[player.id] = player.balance;
        });
        startBalancesRef.current = startBalances;
        setGameStarted(true);
        toast.success('Игра начата! Балансы зафиксированы.', { position: 'top-center' });
    }

    const handleEndGame = () => {
        if (!gameStarted || list.length === 0) {
            toast.error('Нет активной игры для завершения!');
            return;
        }
        // Открываем модальное окно для выбора победителей
        setShowWinnerModal(true);
    }

    const handleWinnerSelection = (playerId: string, isSelected: boolean) => {
        if (isSelected) {
            setSelectedWinners(prev => [...prev, { playerId, percentage: 100 }]);
        } else {
            setSelectedWinners(prev => prev.filter(w => w.playerId !== playerId));
        }
    }

    const handlePercentageChange = (playerId: string, percentage: number) => {
        setSelectedWinners(prev => prev.map(w => 
            w.playerId === playerId ? { ...w, percentage } : w
        ));
    }

    const getTotalPercentage = () => {
        return selectedWinners.reduce((sum, w) => sum + w.percentage, 0);
    }

    const confirmWinners = async () => {
        if (selectedWinners.length === 0) {
            toast.error('Выберите хотя бы одного победителя!');
            return;
        }

        if (getTotalPercentage() !== 100) {
            toast.error('Сумма процентов должна быть равна 100%!');
            return;
        }

        // Проверка на корректное начало игры
        if (!startBalancesRef.current || Object.keys(startBalancesRef.current).length === 0) {
            toast.error('Ошибка: Игра не была корректно начата! Стартовые балансы не сохранены.');
            return;
        }

        setIsEndingGame(true);
        try {
            // Отладочная информация
            console.log('🎮 Start balances:', startBalancesRef.current);
            console.log('🎯 Current players:', list);
            console.log('🏆 Selected winners:', selectedWinners);
            
            // Создаем игровую сессию с выбранными победителями
            const gameSession = GameSessionService.createGameSessionWithWinners(
                list,
                startBalancesRef.current,
                selectedWinners,
                'poker'
            );
            
            console.log('💾 Created game session:', gameSession);

            // Обновляем балансы игроков согласно результатам игры
            const totalPot = getBalance(); // Общий призовой фонд
            
            // Формируем сообщение о победителях (до изменения списка)
            const winnersText = selectedWinners.map(w => {
                const player = list.find(p => p.id === w.playerId);
                const prizeAmount = Math.round((totalPot * w.percentage) / 100);
                return `${player?.name} (${w.percentage}% = ${prizeAmount}$)`;
            }).join(', ');
            
            const updatedList = list.map(player => {
                const winner = selectedWinners.find(w => w.playerId === player.id);
                if (winner) {
                    // Победитель получает свою долю от общего банка
                    const prizeAmount = Math.round((totalPot * winner.percentage) / 100);
                    return { ...player, balance: prizeAmount };
                } else {
                    // Проигравший теряет все деньги
                    return { ...player, balance: 0 };
                }
            });
            
            // Обновляем состояние с новыми балансами
            setList(updatedList);

            // Пересоздаем игровую сессию с обновленными балансами
            const finalGameSession = GameSessionService.createGameSessionWithWinners(
                updatedList,
                startBalancesRef.current,
                selectedWinners,
                'poker'
            );
            
            console.log('💾 Final game session:', finalGameSession);

            // Сохраняем в Firebase
            await GameSessionService.saveGameSession(finalGameSession);

            toast.success(`Игра завершена! Победители: ${winnersText}`, {
                position: 'top-center',
                autoClose: 5000
            });

            // Сбрасываем состояние игры
            setGameStarted(false);
            setShowWinnerModal(false);
            setSelectedWinners([]);
            startBalancesRef.current = {};

        } catch (error) {
            console.error('Error ending game:', error);
            toast.error('Ошибка при сохранении результатов игры');
        } finally {
            setIsEndingGame(false);
        }
    }

    const cancelWinnerSelection = () => {
        setShowWinnerModal(false);
        setSelectedWinners([]);
    }

    const handleKeyDown = (event: any) => {
        if (event.key === 'Enter') {
            if(value) {
                handleSave()
            }
        }
    }

    const getBalance = () => {
        let result = 0
        list.forEach(item => {
            result = Number(result) + Number(item.balance)
        })
        return result
    }

    const getTotalProfit = () => {
        if (!gameStarted || !startBalancesRef.current) return 0;
        
        let totalProfit = 0;
        list.forEach(item => {
            const startBalance = startBalancesRef.current[item.id] || item.balance;
            const profit = item.balance - startBalance;
            totalProfit += profit;
        });
        return totalProfit;
    }

    return (
        <div className={styles.container}>
            {isAdmin && (
                <div className={styles.adminButtons}>
                    <button
                        onClick={handleRefresh}
                        disabled={!isAdmin}
                        className={`${styles.button} ${styles.refreshButton}`}
                    >
                        REFRESH
                    </button>
                    {/* <button
                        onClick={handleClearDatabase}
                        disabled={!isAdmin}
                        className={`${styles.button} ${styles.clearButton}`}
                    >
                        🗑️ CLEAR DB
                    </button> */}
                </div>
            )}
            
            {/* Game Control Buttons */}
            <div className={styles.gameControls}>
                {isAdmin && !gameStarted && list.length > 0 && (
                    <button
                        onClick={handleStartGame}
                        className={`${styles.button} ${styles.startGameButton}`}
                    >
                        🎮 НАЧАТЬ ИГРУ
                    </button>
                )}
                
                {isAdmin && gameStarted && (
                    <button
                        onClick={handleEndGame}
                        disabled={isEndingGame}
                        className={`${styles.button} ${styles.endGameButton}`}
                    >
                        {isEndingGame ? '⏳ Сохранение...' : '🏆 ЗАКОНЧИТЬ ИГРУ'}
                    </button>
                )}
                
                {gameStarted && (
                    <div className={styles.gameStatus}>
                        🎯 Игра активна
                    </div>
                )}
            </div>
            
            <div className={styles.sumBalance}>
                {gameStarted ? (
                    <>
                        Призовой фонд: {getBalance()}$
                        {getTotalProfit() !== 0 && (
                            <span style={{fontSize: '0.9em', opacity: 0.8}}>
                                {getTotalProfit() >= 0 ? ' (+' : ' ('}{getTotalProfit()}$)
                            </span>
                        )}
                    </>
                ) : (
                    <>Sum: {getBalance()} $</>
                )}
            </div>
            {list.map(item => (<div className={styles.list} key={item.id}>
                    {isAdmin && <button
                    onClick={() => setBalance(item.balance + 100, item.id)}
                    className={styles.buttonAdd}
                    disabled={!isAdmin}
                >+
                </button>}
                    {isAdmin && <button
                    onClick={() => setBalance(item.balance - 100, item.id)}
                    className={styles.buttonAdd}
                    disabled={!isAdmin}
                >-
                </button>}
                <div>{item.name}:</div>
                <div className={styles.balance}>{item.balance}$</div>
                    {isAdmin && <button
                    onClick={() => deleteUser(item.id)}
                    className={styles.buttonAdd}
                    disabled={!isAdmin}
                    title="Delete player"
                    aria-label="Delete player"
                >
                        <img className={styles.img} src={DeleteIcon} alt=""/>
                </button>}
            </div>))}
            {isAdmin && <div className={styles.contentName}>
                <div className={styles.containerInput}>
                <input
                    type='text'
                    value={value}
                    onKeyDown={handleKeyDown}
                    onChange={handleChangeName}
                    disabled={!isAdmin}
                        className={styles.input}
                        placeholder="Enter player name..."
                />
                </div>
                <button
                    disabled={!value || !isAdmin}
                    onClick={handleSave}
                    className={styles.button}
                >
                    ADD
                </button>
            </div>}

            {/* Winner Selection Modal */}
            {showWinnerModal && (
                <div className={styles.modalOverlay} onClick={cancelWinnerSelection}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>🏆 Выбор победителей</h2>
                            <button className={styles.closeButton} onClick={cancelWinnerSelection}>
                                ✕
                            </button>
                        </div>
                        
                        <div className={styles.modalContent}>
                            <p className={styles.modalDescription}>
                                Выберите победителей и укажите их долю приза в процентах. Сумма должна быть равна 100%.
                            </p>
                            
                            <div className={styles.playersList}>
                                {list.map((player) => {
                                    const isSelected = selectedWinners.some(w => w.playerId === player.id);
                                    const winnerInfo = selectedWinners.find(w => w.playerId === player.id);
                                    
                                    return (
                                        <div key={player.id} className={styles.playerItem}>
                                            <div className={styles.playerInfo}>
                                                <label className={styles.checkbox}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => handleWinnerSelection(player.id, e.target.checked)}
                                                    />
                                                    <span className={styles.playerName}>{player.name}</span>
                                                </label>
                                                <div className={styles.playerBalance}>
                                                    {startBalancesRef.current[player.id] || player.balance}$ → {player.balance}$ 
                                                    <span className={`${styles.profit} ${
                                                        (player.balance - (startBalancesRef.current[player.id] || player.balance)) >= 0 
                                                            ? styles.positive 
                                                            : styles.negative
                                                    }`}>
                                                        ({(player.balance - (startBalancesRef.current[player.id] || player.balance)) >= 0 ? '+' : ''}
                                                        {player.balance - (startBalancesRef.current[player.id] || player.balance)}$)
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {isSelected && (
                                                <div className={styles.percentageInput}>
                                                    <label>Доля приза:</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="100"
                                                        value={winnerInfo?.percentage || 100}
                                                        onChange={(e) => handlePercentageChange(player.id, parseInt(e.target.value) || 0)}
                                                        className={styles.input}
                                                        aria-label={`Процент приза для ${player.name}`}
                                                    />
                                                    <span>%</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className={styles.prizeInfo}>
                                <div className={styles.totalPrize}>
                                    <strong>Общий призовой фонд: {getBalance()}$</strong>
                                </div>
                                
                                {selectedWinners.length > 0 && (
                                    <div className={styles.winnerPrizes}>
                                        <h4>Распределение приза:</h4>
                                        {selectedWinners.map(winner => {
                                            const player = list.find(p => p.id === winner.playerId);
                                            const prizeAmount = Math.round((getBalance() * winner.percentage) / 100);
                                            return (
                                                <div key={winner.playerId} className={styles.winnerPrize}>
                                                    {player?.name}: {winner.percentage}% = {prizeAmount}$
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                
                                <div className={styles.totalPercentage}>
                                    <strong>Общий процент: {getTotalPercentage()}%</strong>
                                    {getTotalPercentage() !== 100 && (
                                        <span className={styles.error}>
                                            (должно быть 100%)
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className={styles.modalButtons}>
                                <button 
                                    className={styles.cancelButton}
                                    onClick={cancelWinnerSelection}
                                >
                                    Отмена
                                </button>
                                <button 
                                    className={styles.confirmButton}
                                    onClick={confirmWinners}
                                    disabled={isEndingGame || selectedWinners.length === 0 || getTotalPercentage() !== 100}
                                >
                                    {isEndingGame ? '⏳ Сохранение...' : '✅ Завершить игру'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
}

export default AppPage;
