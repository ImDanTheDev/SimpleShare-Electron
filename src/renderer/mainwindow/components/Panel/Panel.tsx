import React, { PropsWithChildren } from 'react';
import styles from './Panel.module.scss';
import { MdMoreVert } from 'react-icons/md';
import { CircleButton } from '../CircleButton/CircleButton';

interface Props {
    title: string;
    onMoreClicked?: () => void;
}

export const Panel: React.FC<Props> = (props: PropsWithChildren<Props>) => {
    return (
        <div className={styles.panel}>
            <div className={styles.titleBar}>
                <div className={styles.title}>{props.title}</div>
                <CircleButton
                    width={26}
                    height={26}
                    onClick={props.onMoreClicked}
                >
                    <MdMoreVert className={styles.moreButtonLabel} />
                </CircleButton>
            </div>
            <div className={styles.body}>{props.children}</div>
        </div>
    );
};
