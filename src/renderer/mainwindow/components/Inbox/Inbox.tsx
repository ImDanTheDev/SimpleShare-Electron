import React, { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../common/redux/store';
import IShare from '../../../common/services/IShare';
import { InboxItem } from '../InboxItem/InboxItem';
import { Panel } from '../Panel/Panel';
import styles from './Inbox.module.scss';

export const Inbox: React.FC = () => {
    const shares: IShare[] = useSelector(
        (state: RootState) => state.shares.shares
    );

    const renderCards = (): ReactNode[] => {
        const cards: ReactNode[] = [];

        shares.forEach((share) => {
            cards.push(<InboxItem key={share.id} share={share} />);
        });

        return cards;
    };

    return (
        <Panel title='Inbox'>
            <div className={styles.inboxItemList}>{renderCards()}</div>
        </Panel>
    );
};
