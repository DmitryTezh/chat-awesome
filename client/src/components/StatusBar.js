import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {userLogout} from '../actions/authActions';
import {startChannel, stopChannel} from '../actions/chatActions';
import {Well, Button, ButtonToolbar} from 'react-bootstrap';
import {Icon} from './Icons';
import {ONLINE_STATUS} from '../actions/chatActions';

class StatusBar extends PureComponent {
    componentDidMount() {
        this.props.startChannel();
    }

    render() {
        const {serverStatus, channelStatus, startChannel, stopChannel, userLogout} = this.props;

        const serverStatusStyle = serverStatus === ONLINE_STATUS.ON ? 'text-success' : 'text-danger';
        const channelStatusStyle = channelStatus === ONLINE_STATUS.ON ? 'text-success' : 'text-danger';

        return (
            <Well>
                <div>
                    <h3 className="no-margin-top">
                        Server
                        {' '}
                        <Icon image="circle" className={serverStatusStyle}/>
                        {' '}
                        Channel
                        {' '}
                        <Icon image="circle" className={channelStatusStyle}/>
                    </h3>
                </div>
                <ButtonToolbar>
                    <Button type="button" bsStyle="primary" disabled={channelStatus === ONLINE_STATUS.ON}
                            onClick={startChannel}>
                        <Icon image="play"/>
                        {' '}
                        Start Channel
                    </Button>
                    <Button type="button" bsStyle="danger" disabled={channelStatus !== ONLINE_STATUS.ON}
                            onClick={stopChannel}>
                        <Icon image="stop"/>
                        {' '}
                        Stop Channel
                    </Button>
                    <Button type="button" bsStyle="warning" onClick={userLogout}>
                        <Icon image="sign-out"/>
                        {' '}
                        Logout
                    </Button>
                </ButtonToolbar>
            </Well>
        )
    }
}

const mapStateToProps = state => ({
    serverStatus: state.chat.serverStatus,
    channelStatus: state.chat.channelStatus
});

export default connect(mapStateToProps, {startChannel, stopChannel, userLogout})(StatusBar);