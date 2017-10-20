import size from 'lodash/size';
import first from 'lodash/first';
import range from 'lodash/range';
import uniqBy from 'lodash/uniqBy';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';

import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import Promise from 'bluebird';

import { fetchBundles } from '../../../actions/BundleActions';
import { fetchLocations, fetchFourLocations } from '../../../actions/LocationActions';
import { fetchTags } from '../../../actions/TagActions';

import {
  LinkTo,
  LocationsTimeArray,
  renderField,
  renderCheckboxField,
  renderTextareaField,
  renderDatePicker,
  renderDropdownList,
  renderMultiselect
} from '../../../helpers';

import { weekDays, capitalize } from '../../../utils';

class PlanForm extends Component {
  static defaultProps = {
    item: {}
  };

  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    item: PropTypes.shape({
      objectId: PropTypes.string
    }),
  };

  constructor(props) {
    super(props);

    this.selectLocation = this.selectLocation.bind(this);
    this.handlerBuild = this.handlerBuild.bind(this);
  }

  componentDidMount() {
    const { fetchBundles, fetchTags, fetchLocations } = this.props;
    Promise.all([
      fetchBundles({}),
      fetchTags({}),
      fetchLocations({})
    ]).then(() => this.handleInitialize());
  }

  handleInitialize() {
    const {
      item, initialize,
      item: {
        bundle, title_event, description_event, image, type_event, tags, locations, partner, start_day, count_attended, is21_age, estimated_cost, end_day, featured, featured_name, featured_link, first_message,
        reoccur_monday, reoccur_tuesday, reoccur_wednesday, reoccur_thursday, reoccur_friday, reoccur_saturday, reoccur_sunday, draft,
      },
    } = this.props;

    if (!isEmpty(item)) {
      initialize({
        bundle: bundle ? { objectId: bundle.objectId } : null,
        start_day: start_day ? start_day.iso : null,
        end_day: end_day ? end_day.iso : null,
        title_event, description_event, image, type_event, tags, locations, partner, count_attended, is21_age, estimated_cost, featured, featured_name, featured_link, first_message,

        // Days of the week
        reoccur_monday, reoccur_tuesday, reoccur_wednesday, reoccur_thursday, reoccur_friday, reoccur_saturday, reoccur_sunday, draft,
      });
    }
  }

  handlerBuild(el) {
    el.preventDefault();

    this.props.fetchFourLocations()
      .then(({ locations }) => {
        const allLocation = [...((this.props.actualDataForm && this.props.actualDataForm.locations) || []), ...locations];

        this.props.dispatch(this.props.change('locations', uniqWith(allLocation, isEqual)));
      })
      .catch(err => console.error(err));
  }

  selectLocation(allLocations, newLocations) {
    if (!newLocations) {
      return;
    }

    const { actualDataForm } = this.props;

    let tags = newLocations.location.tags;

    if (tags && tags.length) {
      if (actualDataForm && actualDataForm.tags) {
        tags = uniqBy(tags.concat(actualDataForm.tags));
      }

      this.props.dispatch(this.props.change('tags', tags));
    }

    let notes = newLocations.location.notes;

    if (notes && notes.length) {
      if (actualDataForm && actualDataForm.first_message) {
        if (actualDataForm.first_message.indexOf(notes) === -1) {
          notes = `${actualDataForm.first_message}\n\n${notes}`;
        } else {
          notes = actualDataForm.first_message;
        }
      }

      this.props.dispatch(this.props.change('first_message', notes));
    }
  }

  render () {
    const { item, locations, tags, errorMessage, handleSubmit, onSave } = this.props;

    const ButtonGroup = (
      <div className="row">
        <div className="col-md-12">
          {errorMessage ? (
            <div className="alert alert-danger">
              <strong>Oops!</strong> {errorMessage}
            </div>
          ) : null}
          <div className="btn-group">
            <LinkTo className="btn btn-default" url="plans">Cancel</LinkTo>
            <button action="submit" className="btn btn-primary">
              {isEmpty(item) ? 'Create Plan' : 'Update Plan'}
            </button>

            {isEmpty(item) && (
              <button className="btn btn-danger" onClick={this.handlerBuild}>Build</button>
            )}
          </div>
        </div>
      </div>
    );

    return (
      <form onSubmit={handleSubmit(plan => {onSave(plan)})}>
        {/* Top panel with buttons */}
        {ButtonGroup}

        {/* Main form */}
        <div className="row">
          <div className="col-md-6">
            <Field name="image" component={renderField} label="URL of banner"/>
            <Field name="title_event" component={renderField} label="Title"/>
            <Field name="description_event" component={renderTextareaField} max={250} label="Description" />
            <Field
              name="tags"
              component={renderMultiselect}
              data={tags.map(({ tag }) => tag)}
              label="Tags"
            />
            <Field
              name="locations"
              valueField="objectId"
              textField="name"
              component={LocationsTimeArray}
              data={locations.map(({ objectId, name, address, tags, notes }) => ({ objectId, name, address, tags, notes }))}
              label="Select Location"
              afterChange={this.selectLocation}
            />
            <Field name="partner" component={renderCheckboxField} label="Partner" />
            <Field
              name="start_day"
              component={renderDatePicker}
              label="Start Day"
            />
            <Field
              name="end_day"
              component={renderDatePicker}
              label="End Day"
            />
            <Field
              name="count_attended"
              component={renderDropdownList}
              data={range(2, 21)}
              label="Number of Attendees"
            />
            <Field
              name="type_event"
              component={renderDropdownList}
              data={[
                'Adventure',
                'Coffee',
                'Dance',
                'Drinks',
                'Featured',
                'Food',
                'Ladies Only',
                'Museum',
                'Music',
                'Promotion',
                'Relax',
                'Sports',
                'Theatre',
                'Tours',
                'VIP',
                'Volunteer',
                'Workout',
                'Test'
              ]}
              label="Experience Type"
            />
            <Field name="is21_age" component={renderCheckboxField} label="Only 21+ Allowed" />
            <Field
              name="estimated_cost"
              component={renderDropdownList}
              data={['FREE', '$', '$$', '$$$', '$$$$', '$$$$$']}
              label="Estimate Cost"
            />
          </div>
          <div className="col-md-6">
            {weekDays.map(day => (
              <Field
                key={day}
                name={`reoccur_${day}`}
                component={renderCheckboxField}
                label={`Every ${capitalize(day)}`}
              />
            ))}
            <Field name="featured" component={renderCheckboxField} label="Featured" />
            <Field name="draft" component={renderCheckboxField} label="Draft" />
            <Field name="featured_name" component={renderField} label="Featured Name" />
            <Field name="featured_link" component={renderField} label="Featured Link" />
            <Field name="first_message" component={renderTextareaField} label="First Chat Message" />
          </div>
        </div>

        {/* Bottom panel with buttons */}
        {ButtonGroup}
      </form>
    );
  }
}

function validate(values) {
  const { bundle, description_event, tags, locations } = values;

  const errors = {};

  // if (!bundle || isEmpty(bundle)) {
  //   errors.bundle = 'Bundle is required';
  // }

  if (size(tags) === 0) {
    errors.tags = 'Tags are required';
  }

  if (size(locations) === 0) {
    errors.locations = 'Location is required';
  }

  if (description_event && description_event.length > 250) {
    errors.description_event = 'Description must be less 250';
  }

  [
    'title_event',
    'description_event',
    'image',
    'start_day',
    'end_day',
    'count_attended',
    'type_event',
    'estimated_cost'
  ].map(field => {
    if (!values[field]) {
      errors[field] = `${capitalize(first(field.split('_')))} is required`;
    }
  });

  return errors;
}

const mapStateToProps = (state) => {
  const { form: { plan }, bundles: { items: bundles }, locations: { items: locations }, tags: { items: tags } } = state;

  let actualDataForm = (plan && plan.values) ? {
    tags: plan.values.tags,
    locations: plan.values.locations,
    first_message: plan.values.first_message,
  } : null;

  return { bundles, locations, tags, actualDataForm };
};
const mapDispatchToProps = ({
  fetchBundles,
  fetchTags,
  fetchLocations,
  fetchFourLocations,
});

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm({ form: 'plan', validate })(PlanForm));