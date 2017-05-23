import React from 'react';
import cl from 'classnames';

import { LinkTo } from '../../helpers';

function BillingTabs({ active }) {
  return (
    <div className="row m-b">
      <div className="col-md-12">
        <ul className="nav nav-tabs">
          <li className={cl({ active: active === 'billing' })}>
            <LinkTo button active={active === 'billing'} color="transparent" url="billing">
              Payment Methods
            </LinkTo>
          </li>
          <li className={cl({ active: active === 'billing/pending' })}>
            <LinkTo button active={active === 'billing/pending'} color="transparent" url="billing/pending">
              Pending Payments
            </LinkTo>
          </li>
          <li className={cl({ active: active === 'billing/history' })}>
            <LinkTo button active={active === 'billing/history'} color="transparent" url="billing/history">
              Payments History
            </LinkTo>
          </li>
        </ul>
      </div>
    </div>
  );
}

BillingTabs.defaultProps = {};

BillingTabs.propTypes = {};

export default BillingTabs;
