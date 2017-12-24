import React from 'react';
import {CSSTransition} from 'react-transition-group';

export const Fade = ({ classNames, children, ...props }) => (
    <CSSTransition timeout={1000} classNames={classNames || 'fade'} {...props}>
        {children}
    </CSSTransition>
);