import React from 'react';
import FacebookLogin from 'react-facebook-login';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';

import { facebookLoginUser } from '../../actions/AuthActions';

import { DataTable } from '../../components';
import { LinkTo } from '../../helpers';

import { FACEBOOK_APP_ID } from '../../config';

function Dashboard({ isAuthenticated, errorMessage, currentUser, facebookLoginUser }) {
  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12 text-center">
          {isAuthenticated ? null : (
              <div>
                <FacebookLogin
                  appId={FACEBOOK_APP_ID}
                  fields="name,email,picture"
                  callback={({ email, accessToken }) => facebookLoginUser({ email, accessToken })}
                  cssClass="btn btn-primary"
                />
                {errorMessage ? <div className="alert alert-danger m-t">{errorMessage}</div> : null }
              </div>
            )}
        </div>
      </div>
      {isAuthenticated && currentUser.is_admin ? <DataTable /> : null}
      {isAuthenticated && currentUser.is_partner ? (
        <div className="row">
          <div className="col-md-12">

              {
                  currentUser.verified == 1 ? null :

                  <div className="row m-b">
                    <div className="col-md-12">

                        <div className="alert alert-info">
                          <strong>Verify your email </strong>
                          An email containing a unique link was sent to your email account <i>{currentUser.email}</i>. Click the link provided in this email message to finish verifying your email address. The web page which then launches will confirm your success.

                        </div>


                    </div>
                  </div>


              }


            <div className="row m-b">
              <div className="col-md-12">
                <div className="ibox-content text-center">
                  <h2>Promote your location during certain times of the day.</h2>
                  <br />
                  <LinkTo button color="success" href="boosts">Boost</LinkTo>
                </div>
              </div>
            </div>


            <div className="row">
              <div className="col-md-6">
                <div className="ibox-content text-center">
                  <h2>Add current specials or create new ones that will be shared with Leaf users</h2>
                  <br />
                  <LinkTo button color="success" href="specials">Add A Special</LinkTo>
                </div>
              </div>

              <div className="col-md-6">
                <div className="ibox-content text-center">
                  <h2>Add curent events or create new ones that will be shared with Lead users.</h2>
                  <br />
                  <LinkTo button color="success" href="events">Add An Event</LinkTo>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default connect(({
  auth: {
    isAuthenticated,
    errorMessage,
    currentUser
  }
}) => ({ isAuthenticated, errorMessage, currentUser }), { facebookLoginUser })(Dashboard);
