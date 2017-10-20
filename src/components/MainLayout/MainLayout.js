import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import includes from 'lodash/includes';

import { validateToken, logoutUser } from '../../actions/AuthActions';
import { fetchBalance } from '../../actions/PaymentMethodActions'
import { fetchLocations } from '../../actions/LocationActions';

import { Header, Footer } from '../../components';

class MainLayout extends Component {

  static propTypes = {

    children: PropTypes.node.isRequired,
      fetchBalance: PropTypes.func.isRequired,
      fetchLocations: PropTypes.func.isRequired,
      balance: PropTypes.number,
      currentUser: PropTypes.object,
  };

  state = {
    fetched: false
  };

  componentWillMount() {

    const { validateToken, currentUser, locations, fetchBalance, fetchLocations } = this.props;

      validateToken().then((data) => {
      /*
          if (currentUser !== null && currentUser.stripe_customer_id !== null && currentUser.stripe_customer_id !== undefined
              && this.props.currentUser.stripe_customer_id.length > 5) {
              fetchBalance(this.props.currentUser)
                  .then(() => this.setState({fetched: true}))
                  .catch(err => {
                      console.log(err);
                  });

              console.log('componentWillMount');

              Promise.all([
                  fetchLocations({})
              ]).then(() => {
                  console.log(locations);
              });
          }
      */
        this.setState({ fetched: true })
      });

  }

  render() {
    const { isAuthenticated, currentUser, logoutUser, balance, location } = this.props;
    const { fetched } = this.state;
    console.log(location);

    document.body.classList.toggle('gray-bg', false);

    if (fetched) {

      if (includes(['/auth/signin', '/auth/signup'], this.props.location.pathname)) {

        document.body.classList.toggle('gray-bg', true);

        return this.props.children;
      }

      return (
        <div id="wrapper">
          <Header isAuthenticated={isAuthenticated} currentUser={currentUser} logoutUser={logoutUser} />
          <div id="page-wrapper" className="gray-bg">
            <div className="row border-bottom" style={{ marginBottom: '10px' }}>
              <nav style={{ marginBottom: 0 }} className="navbar navbar-static-top white-bg" role="navigation">

                <div className="row">
                  <div className="col-md-6">
                      {isAuthenticated ?
                          (   <span>
                              <h2>{location.name}</h2>
                              <h3>Balance: ${balance}</h3>
                              </span>
                          )
                          : null
                      }
                  </div>
                  <div className="col-md-6 text-right balance-label">

                  </div>
                </div>


              </nav>
            </div>
            {this.props.children}
          </div>
        </div>
      );
    }

    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12 text-center">
            <h1>Loading...</h1>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(({
  auth: {
    isAuthenticated,
    currentUser
  },
  paymentMethods: { balance },
  locations: { item: location }
}) => ({ balance, isAuthenticated, currentUser, location }), { validateToken, logoutUser, fetchBalance, fetchLocations })(MainLayout);

