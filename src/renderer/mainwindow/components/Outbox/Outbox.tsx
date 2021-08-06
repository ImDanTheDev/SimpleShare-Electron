import React from 'react';
import { OutboxItem } from '../OutboxItem/OutboxItem';
import { Panel } from '../Panel/Panel';
import styles from './Outbox.module.scss';

export const Outbox: React.FC = () => {
    return (
        <Panel title='Outbox'>
            <div className={styles.outboxItemList}>
                <OutboxItem to='wipUser' fileName='wip.png' content='WIP' />
                <OutboxItem to='wipUser' fileName='wip.png' content='WIP' />
                <OutboxItem to='wipUser' fileName='wip.png' content='WIP' />
                <OutboxItem to='wipUser' fileName='wip.png' content='WIP' />
                <OutboxItem to='wipUser' fileName='wip.png' content='WIP' />
            </div>
        </Panel>
    );
};
