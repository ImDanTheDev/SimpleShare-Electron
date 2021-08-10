import React from 'react';
import styles from './CompleteAccountScreen.module.scss';
import { useDispatch } from 'react-redux';
import { setCurrentScreen } from '../../../common/redux/nav-slice';
import { Panel } from '../Panel/Panel';

export const CompleteAccountScreen: React.FC = () => {
    const dispatch = useDispatch();

    const handleComplete = () => {
        dispatch(setCurrentScreen('HomeScreen'));
    };

    return (
        <div className={styles.screen}>
            <Panel title='Complete Your Account'>
                <button onClick={handleComplete}>Complete Account</button>
            </Panel>
        </div>
    );
};
