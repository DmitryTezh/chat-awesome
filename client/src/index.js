import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import 'core-js/shim';

import App from './startup/App';
import store from './startup/store';

ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>,
    document.querySelector('.main')
);