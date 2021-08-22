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

    const currentProfile = useSelector(
        (state: RootState) =>
            // Find current profile.
            // If current profile doesnt exist, pick the first profile.
            // If no profiles exist, return undefined.
            state.profiles.profiles.find(
                (profile) => profile.id === state.profiles.currentProfileId
            ) || state.profiles.profiles[0]
    );

    const renderCards = (): ReactNode[] => {
        const cards: ReactNode[] = [];

        shares.forEach((share) => {
            cards.push(<InboxItem key={share.id} share={share} />);
        });

        return cards;
    };

    return (
        <Panel
            title={`Inbox - ${currentProfile?.name || 'Unknown Profile'} (${
                shares.length
            })`}
        >
            <div className={styles.inboxItemList}>{renderCards()}</div>
        </Panel>
    );
};
