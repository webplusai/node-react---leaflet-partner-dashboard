import React, { Component } from 'react';
import { connect } from 'react-redux';

import { signinUser } from '../../actions/AuthActions';

import { SigninForm } from '../../components';

class LoginPage extends Component {

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
    errorMessage
  }
}) => ({ isAuthenticated, errorMessage }), { signinUser })(LoginPage);
