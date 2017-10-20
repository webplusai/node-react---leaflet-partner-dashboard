import React, { Component } from 'react';
import { connect } from 'react-redux';

import { signinUser, verifyEmail } from '../../actions/AuthActions';

import { SigninForm } from '../../components';

class VerifyPage extends Component {
    componentDidMount() {

        const { params: { code }, verifyEmail } = this.props;
        verifyEmail(code)
            .then((data) => {
                console.log(data);
                this.setState({ fetched: true })
            })
            .catch(err => {
                console.log(err);
                this.setState({ fetched: true })
            });
    }


    render() {
        const { errorMessage, signinUser, verifyMessage } = this.props;

        return (
            <div className="middle-box text-center loginscreen animated fadeInDown">
                <h2 className="logo-name">Leaf</h2>

                {
                    verifyMessage ?
                        (
                            <div className="alert alert-success">
                                <strong>Success!</strong> {verifyMessage}
                            </div>

                        ) : null
                }

                <SigninForm
                    errorMessage={errorMessage}
                    onSignin={({ email, password }) => signinUser({ email, password })}
                />
            </div>
        );
    }
}

export default connect(({
                            auth: {
                                isAuthenticated,
                                errorMessage,
                                verifyMessage
                            }
                        }) => ({ isAuthenticated, errorMessage,verifyMessage }), { signinUser, verifyEmail })(VerifyPage);


/*
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { verifyEmail, signinUser } from '../../actions/AuthActions';
import { Field, reduxForm } from 'redux-form';

import { renderField } from '../../../helpers';

import { SigninForm } from '../../components';

class VerifyPage extends Component {

    static propTypes = {
        params: PropTypes.object.isRequired,
        verifyEmail: PropTypes.func.isRequired
    };

    state = {
        fetched: false
    };

    componentDidMount() {

        const { params: { code }, VerifyPage } = this.props;
        console.log("verify page did load", code);
        verifyEmail(code)
            .then((data) => {
                console.log(data);
                this.setState({ fetched: true })
            })
            .catch(err => {
                console.log(err);
                this.setState({ fetched: true })
            });
    }

    render() {
        const { errorMessage, signinUser } = this.props;

        return (
            <div className="middle-box text-center loginscreen animated fadeInDown">
                <h2 className="logo-name">Leaf</h2>

                <SigninForm
                    errorMessage={errorMessage}
                    onSignin={({ email, password }) => signinUser({ email, password })}
                />
            </div>
        );
    }
}

export default connect(({
                auth: {
                    isAuthenticated,
                    errorMessage,
                    verifyMessage
                }
            }) => ({ isAuthenticated, errorMessage, verifyMessage }), { verifyEmail, SigninForm })(VerifyPage);

*/