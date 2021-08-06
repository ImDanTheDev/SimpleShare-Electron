import React from 'react';
import { InboxItem } from '../InboxItem/InboxItem';
import { Panel } from '../Panel/Panel';
import styles from './Inbox.module.scss';

export const Inbox: React.FC = () => {
    return (
        <Panel title='Inbox'>
            <div className={styles.inboxItemList}>
                <InboxItem />
                <InboxItem />
                <InboxItem />
                <InboxItem />
                <InboxItem />
            </div>
        </Panel>
    );
};
