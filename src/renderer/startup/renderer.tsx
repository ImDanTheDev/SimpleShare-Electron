import React from 'react';
import ReactDOM from 'react-dom';
import { StartupWindow } from './components/StartupWindow/StartupWindow';
import './index.css';

ReactDOM.render(
    <React.StrictMode>
        <StartupWindow />
    </React.StrictMode>,
    document.getElementById('root')
);
