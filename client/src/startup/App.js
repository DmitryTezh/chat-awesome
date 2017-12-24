import React from 'react';
import {connect} from 'react-redux';
import {Modal} from 'react-bootstrap';
import ChatHeader from '../components/ChatHeader';
import ChatPanel from '../components/ChatPanel';
import StatusBar from '../components/StatusBar';
import MessageForm from '../forms/MessageForm';
import SignInForm from '../forms/SignInForm';
import './App.css';

const App = ({initialized, profile}) => (
    <React.Fragment>
        {
            initialized &&
            <Modal.Dialog>
                <ChatHeader>
                    {profile && `Welcome, ${profile.displayName}!`}
                </ChatHeader>
                {
                    profile &&
                    <Modal.Body>
                        <StatusBar/>
                        <ChatPanel/>
                        <MessageForm/>
                    </Modal.Body>
                }
                {
                    !profile && <SignInForm/>
                }
            </Modal.Dialog>
        }
    </React.Fragment>
);

const mapStateToProps = state => ({
    initialized: state.auth.initialized,
    profile: state.auth.profile
});

export default connect(mapStateToProps)(App);