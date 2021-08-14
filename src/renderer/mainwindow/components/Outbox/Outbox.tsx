import React, { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearOutbox } from '../../../common/redux/outbox-slice';
import { RootState } from '../../../common/redux/store';
import IShare from '../../../common/services/IShare';
import { OutboxItem } from '../OutboxItem/OutboxItem';
import { Panel } from '../Panel/Panel';
import styles from './Outbox.module.scss';

export const Outbox: React.FC = () => {
    const dispatch = useDispatch();

    const shares: IShare[] = useSelector(
        (state: RootState) => state.outbox.shares
    );

    const renderCards = (): ReactNode[] => {
        const cards: ReactNode[] = [];

        shares.forEach((share, i) => {
            cards.push(<OutboxItem key={i} share={share} />);
        });

        return cards;
    };

    const handleClear = () => {
        dispatch(clearOutbox());
    };

    return (
        <Panel
            title={`Outbox (${shares.length})`}
            right={
                <span className={styles.clearLink} onClick={handleClear}>
                    Clear
                </span>
            }
        >
            <div className={styles.outboxItemList}>{renderCards()}</div>
        </Panel>
    );
};
