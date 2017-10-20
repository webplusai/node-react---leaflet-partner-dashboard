import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { deleteEvent } from '../../actions/EventActions';

import { EventDelete } from '../../components';
import { Tabs } from '../../helpers';

class EventDeletePage extends Component {
  render() {
    const { params: { itemID }, deleteEvent } = this.props;
    return (
      <div className="container">
          <h3 className="events-delete-title">Delete Evenet</h3>
        <Tabs modelsName="events" itemID={itemID} />
        <EventDelete itemID={itemID} onDelete={id => deleteEvent(id)} />
      </div>
    );
  }
}

export default connect(null, { deleteEvent })(EventDeletePage);