import React from 'react';
import ReactDOM from 'react-dom';
import MainWindow from './components/MainWindow/MainWindow';
import EnhancedComponent from '../common/EnhancedComponent/EnhancedComponent';

ReactDOM.render(
    <EnhancedComponent>
        <MainWindow />
    </EnhancedComponent>,
    document.getElementById('root')
);
