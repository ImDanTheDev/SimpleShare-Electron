import React, { useState } from 'react';
import { MdExpandMore } from 'react-icons/md';
import styles from './InputDropdown.module.scss';

interface Props {
    items: { [key: string]: string };
    defaultKey?: string;
    unselectedText?: string;
    onSelectionChanged: (key: string) => void;
}

export const InputDropdown: React.FC<Props> = (props: Props) => {
    const [selectedItem, setSelectedItem] = useState<string | undefined>(
        props.defaultKey
    );
    const [expanded, setExpanded] = useState<boolean>(false);

    const selectItem = (key: string) => {
        setSelectedItem(key);
        props.onSelectionChanged(key);
        setExpanded(false);
    };

    return (
        <div className={styles.accountGroup}>
            <div
                className={expanded ? styles.expandedPicker : styles.picker}
                onMouseLeave={() => setExpanded(false)}
            >
                <div
                    className={styles.pickerContent}
                    onClick={() => setExpanded(!expanded)}
                >
                    <div className={styles.welcomeGroup}>
                        {selectedItem
                            ? props.items[selectedItem]
                            : props.unselectedText || ''}
                    </div>
                    <div className={styles.arrow}>
                        <MdExpandMore />
                    </div>
                </div>
                <div className={styles.dropdown}>
                    {Object.entries(props.items).map(([key, value]) => (
                        <div
                            key={key}
                            className={styles.dropdownItem}
                            onClick={() => selectItem(key)}
                        >
                            {value}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
