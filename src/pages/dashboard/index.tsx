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
            <button
                style={{backgroundColor: '#13aa52'}}
                className={styles.button}
                onClick={handleContinue}>
                CONTINUE
            </button>
            <button
                onClick={handleRefresh}
                style={{backgroundColor: '#FF013C'}}
                className={styles.button}
            >
                REFRESH
            </button>
        </div>
    );
}

export default Dashboard;
