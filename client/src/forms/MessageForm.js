import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {reduxForm, submit} from 'redux-form';
import {Form, Field} from 'redux-form';
import {FormGroup} from 'react-bootstrap';
import {Button, ButtonToolbar} from 'react-bootstrap';
import {submitMessage, submitTyping} from '../actions/chatActions';
import {FormField} from './FormField';
import {Icon} from '../components/Icons';

class MessageForm extends PureComponent {
    handleKeyPress = (event) => {
        if (event.which === 13 && !event.shiftKey) {
            event.preventDefault();
            const {dispatch} = this.props;
            dispatch(submit('messageForm'));
        }
        else {
            const {profile, submitTyping} = this.props;
            submitTyping(profile.displayName);
        }
    };

    sendMessage = async (values) => {
        if (!values.message) return;

        const {profile, submitMessage, reset} = this.props;
        await submitMessage(profile.displayName, values.message);
        await reset();

        if (this.textInput) {
            this.textInput.focus();
        }
    };

    attrs = {
        rows: 5,
        autoFocus: true,
        style: {resize: 'vertical'},
        inputRef: input => this.textInput = input,
        onKeyPress: this.handleKeyPress
    };

    render() {
        const {handleSubmit, reset, pristine, submitting} = this.props;

        return (
            <Form onSubmit={handleSubmit(this.sendMessage)}>
                <Field name="message" placeholder="Type your message"
                       componentClass="textarea" component={FormField}
                       attrs={this.attrs}/>
                <FormGroup className="no-margin-bottom">
                    <ButtonToolbar>
                        <Button type="submit" bsStyle="primary" disabled={pristine || submitting}>
                            <Icon image={submitting ? 'spinner' : 'paper-plane'} className={(submitting && 'fa-pulse') || ''}/>
                            {' '}
                            Send
                        </Button>
                        <Button type="button" disabled={pristine || submitting} onClick={reset}>
                            <Icon image="trash"/>
                            {' '}
                            Clear
                        </Button>
                    </ButtonToolbar>
                </FormGroup>
            </Form>
        )
    }
}

MessageForm = reduxForm({
    form: 'messageForm',
    touchOnBlur: false
})(MessageForm);

const mapStateToProps = state => ({
    profile: state.auth.profile
});

export default connect(mapStateToProps, {submitMessage, submitTyping})(MessageForm);