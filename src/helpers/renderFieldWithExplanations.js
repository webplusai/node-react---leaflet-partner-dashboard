import React, { PropTypes } from 'react';
import cl from 'classnames';

function renderFieldWithExplanations({ input, type, label, placeholder, addon, meta: { touched, error, warning }, afterChange }) {
  const onChangeInput = (value) => {
    input.onChange(value);
  
    if (afterChange)
      afterChange(value);
  };

  return (
    <fieldset className={cl('form-group', { 'has-error': (touched && error) })}>
      <div className="b-input-group">
        <div className="b-input-group__input">
          {label ? <label>{label}</label> : null}
  
          <input className="form-control" {...input} placeholder={placeholder || label} type={type} onChange={onChangeInput} />
  
          {touched && ((error && <div className="error help-block">{error}</div>) || (warning && <div className="error">{warning}</div>))}
        </div>

        {addon && (<div className="b-input-group__addon">{addon}</div>)}
      </div>
    </fieldset>
  );
}

renderFieldWithExplanations.propTypes = {
  input: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  label: PropTypes.string,
  type: PropTypes.string
};

export default renderFieldWithExplanations;
