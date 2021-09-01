import React from 'react';
import styles from './InboxItem.module.scss';
import { MdDeleteForever } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { setCurrentModal } from '../../../common/redux/nav-slice';
import { deleteCloudShare, IShare, setCurrentShare } from 'simpleshare-common';

interface Props {
    share: IShare;
}

export const InboxItem: React.FC<Props> = (props: Props) => {
    const dispatch = useDispatch();

    const handleDelete = async () => {
        dispatch(deleteCloudShare(props.share));
    };

    const handleCopyText = async () => {
        await navigator.clipboard.writeText(props.share.content);
    };

    const handleView = () => {
        dispatch(setCurrentShare(props.share));
        dispatch(setCurrentModal('ViewShareModal'));
    };

    return (
        <div className={styles.item}>
            <div className={styles.header}>
                <div className={styles.preview}></div>
                <div className={styles.fromGroup}>
                    <div className={styles.fromUser}>
                        {props.share.fromDisplayName}
                    </div>
                    <div className={styles.fromProfile}>
                        {props.share.fromProfileName}
                    </div>
                </div>
            </div>

            <div className={styles.body}>
                <span>{props.share.content}</span>
            </div>

            <div className={styles.footer}>
                <div className={styles.deleteButton} onClick={handleDelete}>
                    <MdDeleteForever />
                </div>
                <div className={styles.copyTextButton} onClick={handleCopyText}>
                    Copy Text
                </div>
                <div className={styles.viewButton} onClick={handleView}>
                    View
                </div>
            </div>
        </div>
    );
};
