import React from 'react';
import ReactDOM from 'react-dom';
import EnhancedComponent from '../common/EnhancedComponent/EnhancedComponent';
import { UpdateWindow } from './components/UpdateWindow/UpdateWindow';

ReactDOM.render(
    <EnhancedComponent>
        <UpdateWindow />
    </EnhancedComponent>,
    document.getElementById('root')
);
