import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';

import { renderField } from '../../../helpers';

class SigninForm extends Component {
  render() {
    const { errorMessage, handleSubmit, onSignin } = this.props;

    return (
      <form onSubmit={handleSubmit(({ email, password }) => onSignin({ email, password }))}>
        <Field name="email" component={renderField} className="form-control" placeholder="Email" />
        <Field name="password" component={renderField} className="form-control" placeholder="Password" type="password" />
        {errorMessage ? (
            <div className="alert alert-danger">
              <strong>Oops!</strong> {errorMessage}
            </div>
          ) : null}
        <button action="submit" className="btn btn-primary block full-width m-b">Login</button>
      </form>
    );
  }
}

function validate({ email, password }) {
  const errors = {};

  if (!email) {
    errors.email = 'Please enter an email';
  }

  if (!password) {
    errors.password = 'Please enter a password';
  }

  return errors;
}

export default reduxForm({ form: 'signin', validate })(SigninForm);