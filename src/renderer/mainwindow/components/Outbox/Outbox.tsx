import React, { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../common/redux/store';
import IShare from '../../../common/services/IShare';
import { OutboxItem } from '../OutboxItem/OutboxItem';
import { Panel } from '../Panel/Panel';
import styles from './Outbox.module.scss';

export const Outbox: React.FC = () => {
    const shares: IShare[] = useSelector(
        (state: RootState) => state.outbox.shares
    );

    const renderCards = (): ReactNode[] => {
        const cards: ReactNode[] = [];

        shares.forEach((share) => {
            cards.push(<OutboxItem key={share.id} share={share} />);
        });

        return cards;
    };

    return (
        <Panel title='Outbox'>
            <div className={styles.outboxItemList}>{renderCards()}</div>
        </Panel>
    );
};
