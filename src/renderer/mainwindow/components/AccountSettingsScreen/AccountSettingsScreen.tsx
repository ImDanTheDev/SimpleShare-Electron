import React from 'react';
import { Panel } from '../Panel/Panel';
import { CircleButton } from '../CircleButton/CircleButton';
import { MdChevronLeft } from 'react-icons/md';
import styles from './AccountSettingsScreen.module.scss';
import { useDispatch } from 'react-redux';
import { setCurrentScreen } from '../../../common/redux/nav-slice';

export const AccountSettingsScreen: React.FC = () => {
    const dispatch = useDispatch();

    const handleBack = () => {
        dispatch(setCurrentScreen('HomeScreen'));
    };

    return (
        <div className={styles.screen}>
            <Panel
                title='Account Settings'
                left={
                    <CircleButton width={26} height={26} onClick={handleBack}>
                        <MdChevronLeft className={styles.backButtonIcon} />
                    </CircleButton>
                }
            ></Panel>
        </div>
    );
};
