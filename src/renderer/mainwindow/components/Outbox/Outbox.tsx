import React, { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearOutbox, OutboxEntry } from 'simpleshare-common';
import { RootState } from '../../../common/redux/store';
import { OutboxItem } from '../OutboxItem/OutboxItem';
import { Panel } from '../Panel/Panel';
import styles from './Outbox.module.scss';

export const Outbox: React.FC = () => {
    const dispatch = useDispatch();

    const outboxEntries: OutboxEntry[] = useSelector(
        (state: RootState) => state.outbox.shares
    );

    const renderCards = (): ReactNode[] => {
        const cards: ReactNode[] = [];

        outboxEntries.forEach((entry, i) => {
            cards.push(<OutboxItem key={i} entry={entry} />);
        });

        return cards;
    };

    const handleClear = () => {
        dispatch(clearOutbox());
    };

    return (
        <Panel
            title={`Outbox (${outboxEntries.length})`}
            right={
                outboxEntries.length > 0 ? (
                    <span className={styles.clearLink} onClick={handleClear}>
                        Clear
                    </span>
                ) : (
                    <></>
                )
            }
        >
            <div className={styles.outboxItemList}>{renderCards()}</div>
        </Panel>
    );
};
