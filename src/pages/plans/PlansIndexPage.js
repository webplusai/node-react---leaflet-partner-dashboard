import React, { Component, PropTypes } from 'react';
import { Pagination } from 'react-bootstrap';
import { connect } from 'react-redux';

import { fetchPlans } from '../../actions/PlanActions';
import { PlansList, SearchForm } from '../../components';
import { LinkTo, Loading } from '../../helpers';

class PlansIndexPage extends Component {

  static propTypes = {
    items: PropTypes.array.isRequired,
    fetchPlans: PropTypes.func.isRequired
  };

  state = {
    fetched: false,
    search: '',
    limit: 30,
    page: 1,
    order: '-createdAt',
    include: 'bundle,locations.location'
  };

  constructor(props) {
    super(props);

    this.selectPage = this.selectPage.bind(this);
  }

  componentDidMount() {
    const { order, include, limit, page } = this.state;
    this.fetchData({ order, include, limit, page });
  }

  fetchData({ search, order, include, filters, limit, page }) {
    const { fetchPlans } = this.props;
    this.setState({ search, fetched: false }, () => fetchPlans({ order, include, search, filters, limit, page })
      .then(() => this.setState({ fetched: true })));
  }
  
  selectPage(selectedPage) {
    const { order, limit } = this.state;

    this.setState({ page: selectedPage }, () => this.fetchData({ order, limit, page: this.state.page }));
  }

  render() {
    const { items, count } = this.props;
    const { fetched, order, include, limit, page } = this.state;

    const ignoreLoaderConponent = (
      <div className="row m-b">
        <div className="col-md-2">
          <LinkTo className="btn btn-success" url="plans/new">Create Plan</LinkTo>
        </div>
        <div className="col-md-4">
          {fetched ? <h4>Plans ({count})</h4> : null}
        </div>
        <div className="col-md-6 text-right">
          <SearchForm onSearch={({ search }) => this.fetchData({ search, order, include, limit, page: 1 })} />
        </div>
      </div>
    );

    return (
      <Loading className="container" ignoreLoader={ignoreLoaderConponent} loaded={fetched}>
        <PlansList items={items} />

        {(count > limit) && (
          <Pagination prev next first last ellipsis boundaryLinks bsSize="medium" items={Math.ceil(count / limit)} maxButtons={5} activePage={page} onSelect={this.selectPage} />
        )}
      </Loading>
    );
  }
}

export default connect(({ plans: { items, count } }) => ({ items, count }), { fetchPlans })(PlansIndexPage);
