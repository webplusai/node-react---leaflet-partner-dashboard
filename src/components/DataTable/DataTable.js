import take from 'lodash/take';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchData } from '../../actions/DataActions';

class InfoCell extends Component {
  render() {
    return (
      <div className="row">
        <div className="col-md-12">
          <h1 className="text-center">{this.props.content}</h1>
          <h3 className="text-center">{this.props.title}</h3>
        </div>
      </div>
    );
  }
}

class TableCell extends Component {
  render() {
    return (
      <div className="row">
        <div className="col-md-12">
          <table className="table table-bordered table-hover table-striped table-responsive">
            <tbody className="cell-ages">
            {this.props.content}
            </tbody>
          </table>
          <h3 className="text-center">{this.props.title}</h3>
        </div>
      </div>
    );
  }
}

class DataTable extends Component {

  componentDidMount() {
    this.props.fetchData();
  }

  render() {
    const { item } = this.props;

    return (
      <div>
        <div className="row">
          <div className="col-md-3">
            <InfoCell title="Downloads" content={item.installations_count}/>
          </div>
          <div className="col-md-3">
            <InfoCell title="Users" content={item.users_count}/>
          </div>
          <div className="col-md-3">
            <InfoCell title="Total Invites Sent" content={item.event_notifications_count}/>
          </div>
          <div className="col-md-3">
            <InfoCell title="Total Invites Accepted" content={item.accepted_event_notifications_count}/>
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col-md-3">
            <TableCell title="Tags" content={take(item.tags || [], 10).map(({ tag, per_cent }, index) => (
              <tr key={index}>
                <td>{tag}</td>
                <td>{per_cent.toFixed(2)}%</td>
              </tr>
            ))}/>
          </div>
          <div className="col-md-3">
            <TableCell title="Ages" content={take(item.users_ages || [], 10).map(({ age, per_cent }, index) => (
              <tr key={index}>
                <td>{age}</td>
                <td>{per_cent.toFixed(2)}%</td>
              </tr>
            ))}/>
          </div>
          <div className="col-md-3">
            <TableCell title="User Cities" content={take(item.user_location_cities || [], 10).map(({ city, per_cent }, index) => (
              <tr key={index}>
                <td>{city}</td>
                <td>{per_cent.toFixed(2)}%</td>
              </tr>
            ))}/>
          </div>
          <div className="col-md-3">
            <TableCell title="Requested Cities" content={take(item.user_event_cities || [], 10).map(({ city, per_cent }, index) => (
              <tr key={index}>
                <td>{city}</td>
                <td>{per_cent}</td>
              </tr>
            ))}/>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(({ data: { item } }) => ({ item }), { fetchData })(DataTable);