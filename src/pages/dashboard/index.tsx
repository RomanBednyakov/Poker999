import React from 'react';

import { LIST_PAGES} from '../../moks';

import styles from './style.module.css';

type DashboardType = {
    setActivePage: (state: string) => void;
}

const Dashboard: React.FC<DashboardType> = ({setActivePage}) => {

    const handleContinue = () => {
        setActivePage(LIST_PAGES.APP)
    }

    const handleRefresh = () => {
        setActivePage(LIST_PAGES.HOME)
    }
    return (
        <div className={styles.Container}>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <button
                className={`${styles.button} ${styles.continueButton}`}
                onClick={handleContinue}>
                CONTINUE
            </button>
            <button
                className={`${styles.button} ${styles.refreshButton}`}
                onClick={handleRefresh}
            >
                REFRESH
            </button>
        </div>
    );
}

export default Dashboard;
