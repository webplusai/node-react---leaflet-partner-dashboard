import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { batchCreateEvents } from '../../actions/EventActions';

import { EventBulkUploadForm } from '../../components';

class EventBulkUploadPage extends Component {

    static propTypes = {
        batchCreateEvents: PropTypes.func.isRequired
    };

    render() {
        const { errorMessage, currentUser, batchCreateEvents } = this.props;

        return (
            <div className="container">
                <h3 className="events-add-title">Bulk Upload Events</h3>
                <EventBulkUploadForm errorMessage={errorMessage} onSave={events => batchCreateEvents(events, currentUser)} />
            </div>
        );
    }
}

export default connect(({
        auth: { currentUser },
        events: { errorMessage }
    }) => ({ errorMessage, currentUser }), { batchCreateEvents })(EventBulkUploadPage);