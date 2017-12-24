/**
 * Created by tezhdmi on 19/12/17.
 */
import React from 'react';
import {Modal} from 'react-bootstrap';
import {Icon} from './Icons';

const ChatHeader = ({children}) => (
    <Modal.Header>
        <Modal.Title className="text-center text-primary">
            <div>
                <h2 className="no-margin-top no-margin-bottom">
                    <Icon image="whatsapp" size="2x"/><br/>
                    {children || 'Chat Awesome'}
                </h2>
            </div>
        </Modal.Title>
    </Modal.Header>
);

export default ChatHeader;