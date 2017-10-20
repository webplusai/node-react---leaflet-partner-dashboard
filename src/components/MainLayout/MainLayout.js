import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import includes from 'lodash/includes';

import { validateToken, logoutUser } from '../../actions/AuthActions';
import { fetchBalance } from '../../actions/PaymentMethodActions'

import { Header, Footer } from '../../components';

class MainLayout extends Component {

  static propTypes = {
    children: PropTypes.node.isRequired,
      fetchBalance: PropTypes.func.isRequired,
      balance: PropTypes.number
  };

  state = {
    fetched: false
  };

  componentWillMount() {

    const { validateToken, fetchBalance, currentUser } = this.props;

      validateToken().then(() => this.setState({ fetched: true }));
    if (currentUser !== null && currentUser.stripe_customer_id !== null && currentUser.stripe_customer_id !== undefined
        && this.props.currentUser.stripe_customer_id.length > 5) {
        fetchBalance(this.props.currentUser)
            .then(() => this.setState({fetched: true}))
            .catch(err => {
                console.log(err);
            })
    }


  }

  render() {
    const { isAuthenticated, currentUser, logoutUser, balance } = this.props;
    const { fetched } = this.state;

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

                  </div>
                  <div className="col-md-6 text-right balance-label">
                    <h3>Balance: ${balance}</h3>
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
  paymentMethods: { balance }
}) => ({ balance, isAuthenticated, currentUser }), { validateToken, logoutUser, fetchBalance })(MainLayout);