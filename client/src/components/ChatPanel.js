import React, {PureComponent} from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {Well, Alert} from 'react-bootstrap';
import {TransitionGroup} from 'react-transition-group';
import {Icon} from './Icons';
import {Fade} from './Fade';
import {topMessageSelector} from '../reducers/chatReducer';

const ChatItem = ({message, profile, children}) => (
    <tr>
        <td>
            <Alert
                bsStyle={message.sender === profile.displayName
                    ? (message.receiveDate || message.acknowledgeDate ? 'info' : 'warning')
                    : (message.sender === 'bot' ? 'info' : 'success')}
                className={message.sender === profile.displayName ? 'pull-right' : 'pull-left'}>
                {children}
            </Alert>
        </td>
    </tr>
);

class ChatPanel extends PureComponent {
    static getTimeString(value) {
        const date = new Date(value);
        return date.toLocaleDateString() === new Date(Date.now()).toLocaleDateString() ? date.toLocaleTimeString() : date.toLocaleString();
    }

    scrollToBottom = () => {
        const container = ReactDOM.findDOMNode(this.container);
        container.scrollTop = container.scrollHeight;
    };

    componentDidMount() {
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    render() {
        const {profile, messages, usersTyping} = this.props;

        return (
            <Well className="chat-wrapper" ref={input => this.container = input}>
                {
                    messages.length === 0 &&
                    <div className="center-wrapper">
                        <div className="center-content">
                            <h1 className="no-margin-top text-primary">
                                <Icon image="whatsapp" size="5x"/><br/>
                                Chat Awesome
                            </h1>
                        </div>
                    </div>
                }
                <table className="chat-content">
                    <TransitionGroup component="tbody">
                        {
                            messages.map(message =>
                                <Fade key={message.id}>
                                    <ChatItem message={message} profile={profile}>
                                        {
                                            message.sender !== 'bot' &&
                                            <h4>
                                                <strong>{message.sender}{message.sender === profile.displayName ? ' (me)' : ''}{':'}</strong>
                                            </h4>
                                        }
                                        <p>{message.body}</p>
                                        <p className="no-margin-bottom small-size pull-right">{ChatPanel.getTimeString(message.submitDate)}</p>
                                    </ChatItem>
                                </Fade>
                            )
                        }
                        {
                            usersTyping.map(user =>
                                <Fade key={`typing-${user}`}>
                                    <ChatItem message={{sender: user}} profile={profile}>
                                        <h4>{user}{' is typing...'}</h4>
                                    </ChatItem>
                                </Fade>
                            )
                        }
                    </TransitionGroup>
                </table>
            </Well>
        )
    }
}

const messageSelector = topMessageSelector(30);
const mapStateToProps = state => ({
    profile: state.auth.profile,
    messages: messageSelector(state),
    usersTyping: state.chat.usersTyping
});

export default connect(mapStateToProps)(ChatPanel);