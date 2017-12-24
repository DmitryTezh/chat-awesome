/**
 * Created by tezhdmi on 18/12/17.
 */
import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {Form, Field} from 'redux-form';
import {Modal, Alert, Button} from 'react-bootstrap';
import {userLogon, logonClear} from '../actions/authActions';
import {FormField} from './FormField';
import {Icon} from '../components/Icons';

const requiredValidator = warning => value => value && value.toString().trim() ? undefined : warning;
const minLengthValidator = (warning, min) => value => value && value.trim().length < min ? warning : undefined;

class SignInForm extends PureComponent {
    signin = (values) => {
        const {userLogon} = this.props;
        userLogon(values.login, values.password);
    };

    reset = () => {
        const {reset, logonClear} = this.props;
        reset();
        logonClear();
    };

    render() {
        const {handleSubmit, pristine, requesting: submitting, authError: error} = this.props;

        return (
            <React.Fragment>
                <Modal.Body>
                    {
                        error &&
                        <Alert bsStyle="danger" className="text-center">
                            {error}
                        </Alert>
                    }
                    <Form onSubmit={handleSubmit(this.signin)}>
                        <Field name="login" placeholder="LOGIN" type="text" component={FormField}
                               validate={[requiredValidator('Empty login'), minLengthValidator('Short login', 5)]}/>
                        <Field name="password" placeholder="PASSWORD" type="password" component={FormField}
                               validate={[requiredValidator('Empty password'), minLengthValidator('Short password', 8)]}/>

                        <Button type="submit" bsStyle="primary" disabled={submitting} block>
                            <Icon image={submitting ? 'spinner' : 'sign-in'}
                                  className={(submitting && 'fa-pulse') || ''}/>
                            {' '}
                            SIGN IN
                        </Button>
                        <Button type="button" disabled={pristine || submitting} onClick={this.reset} block>
                            <Icon image="trash"/>
                            {' '}
                            CLEAR
                        </Button>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Alert bsStyle="warning" className="text-center no-margin-bottom">
                        <strong>CHAT AWESOME DISCLAIMER</strong><br/>
                        This is a simple chat application, only for testing purposes.
                        We do not responsible for any issues which could be happen here.
                        All messages posted in this chat could be loosen and do not contain any reasonable meaning.
                        By sign in to this chat you agree with this disclaimer.
                        If you disagree with this disclaimer please do not proceed.
                    </Alert>
                </Modal.Footer>
            </React.Fragment>
        )
    }
}

SignInForm = reduxForm({
    form: 'signinForm',
    touchOnBlur: false
})(SignInForm);

const mapStateToProps = state => ({
    requesting: state.auth.requesting,
    authError: state.auth.error
});

export default connect(mapStateToProps, {userLogon, logonClear})(SignInForm);