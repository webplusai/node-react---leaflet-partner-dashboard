import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { deleteSpecial } from '../../actions/SpecialActions';

import { SpecialDelete } from '../../components';
import { Tabs } from '../../helpers';

class SpecialDeletePage extends Component {
  render() {
    const { params: { itemID }, deleteSpecial } = this.props;
    return (
      <div className="container">
          <h3 className="special-delete-title">Delete Special</h3>
        <Tabs modelsName="specials" itemID={itemID} />
        <SpecialDelete itemID={itemID} onDelete={id => deleteSpecial(id)} />
      </div>
    );
  }
}

export default connect(null, { deleteSpecial })(SpecialDeletePage);