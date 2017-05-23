import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';

import { renderFieldWithExplanations } from '../../../helpers';

class SignupForm extends Component {

  render() {
    const { errorMessage, handleSubmit, onSignup } = this.props;
    
    const addon = null;

    return (
      <form onSubmit={handleSubmit(user => onSignup(user))}>
        <Field name="first_name" component={renderFieldWithExplanations} className="form-control" label="First Name" />
        <Field name="last_name" component={renderFieldWithExplanations} className="form-control" label="Last Name" />
        <Field name="email" component={renderFieldWithExplanations} className="form-control" label="Email" />
        <Field name="password" component={renderFieldWithExplanations} className="form-control" type="password" label="Password" />
        <Field name="passwordConfirmation" component={renderFieldWithExplanations} className="form-control" type="password" label="Confirm Password" />
        <Field name="personal_phone" component={renderFieldWithExplanations} className="form-control" label="Personal Phone Number" />
        <Field name="job_title" component={renderFieldWithExplanations} className="form-control" label="Job Title" addon={addon} />
        {errorMessage && (
          <div className="alert alert-danger">
            <strong>Oops!</strong> {errorMessage}
          </div>
        )}
        <button action="submit" className="btn btn-primary block full-width m-b">Sign Up</button>
      </form>
    );
  }
}

function validate({ email, password, passwordConfirmation }) {
  const errors = {};

  if (!email) {
    errors.email = 'Please enter an email';
  }

  if (!password) {
    errors.password = 'Please enter a password';
  }

  if (!passwordConfirmation) {
    errors.passwordConfirmation = 'Please enter a password confirmation';
  }

  if (password !== passwordConfirmation) {
    errors.password = 'Passwords must match';
  }
  return errors;
}

export default reduxForm({ form: 'signin', validate })(SignupForm);