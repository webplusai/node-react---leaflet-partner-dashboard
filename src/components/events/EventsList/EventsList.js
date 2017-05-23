import size from 'lodash/size';
import React, { PropTypes } from 'react';

import { LinkTo, BooleanField } from '../../../helpers';
import { renderDate, renderDateTime } from '../../../utils';

function EventsList({ items }) {

  if (size(items) > 0) {
    return (
      <table className="table table-bordered table-hover table-striped table-responsive">
        <thead>
        <tr>
          <th>Event Type</th>
          <th>Dates</th>
          <th>Start Time</th>
          <th>End Time</th>
          <th>Redemption</th>
          <th>Created</th>
          <th />
        </tr>
        </thead>
        <tbody>
        {items.map(({ objectId, event_type, dates, start_time, end_time, location, redemption, cost, special, boost, createdAt }) => (
          <tr key={objectId}>
            <td>
              {event_type ? <LinkTo url={`eventTypes/${event_type.objectId}`}>{event_type.name}</LinkTo> : null}
            </td>
            <td>
              {size(dates || []) > 0 ? (
                  <table className="table table-bordered table-hover table-striped table-responsive events-created">
                    <tbody>
                    {(dates || []).map(({ date, name, start, end }, index) => (
                      <tr key={index}>
                        <td>{date}</td>
                        <td>{name}</td>
                        <td>{start}</td>
                        <td>{end}</td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                ) : null}
            </td>
            <td>{renderDateTime(start_time)}</td>
            <td>{renderDateTime(end_time)}</td>
            <td>{redemption ? redemption.name : null}</td>
            <td>{renderDate(createdAt)}</td>
            <td>
              <LinkTo className="btn btn-primary" url={`events/${objectId}/edit`}>Edit</LinkTo>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    );
  }

  return (
    <h2>No Items</h2>
  );
}

EventsList.propTypes = {
  items: PropTypes.array.isRequired
};

export default EventsList;