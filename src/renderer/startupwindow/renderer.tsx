import React from 'react';
import ReactDOM from 'react-dom';
import { StartupWindow } from './components/StartupWindow/StartupWindow';
import EnhancedComponent from '../common/EnhancedComponent/EnhancedComponent';

ReactDOM.render(
    <EnhancedComponent>
        <StartupWindow />
    </EnhancedComponent>,
    document.getElementById('root')
);
