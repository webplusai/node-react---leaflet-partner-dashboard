import React from 'react';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { browserHistory } from 'react-router';

import { LinkTo } from '../../helpers';
import { isActive } from '../../utils';

function Header({ isAuthenticated, currentUser, logoutUser }) {
  const { is_admin, is_partner } = currentUser;
  const { push } = browserHistory;

  const icon = (
    <li className="nav-header">
      <LinkTo className="block m-t-xs dropdown-toggle icon" href="" />
    </li>
  );

  return (
    <nav className="navbar-admin navbar-default navbar-static-side">
      {isAuthenticated ? (
        <ul className="nav metismenu">
          {icon}
          {is_admin && (
            <NavItem active={isActive('plans')} href="/plans" className="plans-nav" onSelect={() => push('/plans')}>Plans</NavItem>
          )}
          {(is_admin || is_partner) && (
            <NavItem  active={isActive('events')} href="/events" className="events-nav" onSelect={() => push('/events')}>Events</NavItem>
          )}
          {is_admin && (
            <NavItem active={isActive('eventTypes')} href="/eventTypes" className="eventtypes-nav" onSelect={() => push('/eventTypes')}>Event Types</NavItem>
          )}
          {(is_admin || is_partner) && (
            <NavItem active={isActive('specials')} href="/specials" className="specials-nav" onSelect={() => push('/specials')}>Specials</NavItem>
          )}
          {(is_admin || is_partner) && (
            <NavItem active={isActive('boosts')} href="/boosts" className="boosts-nav" onSelect={() => push('/boosts')}>Boosts</NavItem>
          )}
          {is_admin && (
            <NavItem active={isActive('locations')} href="/locations" className="locations-nav" onSelect={() => push('/locations')}>Locations</NavItem>
          )}
          {is_admin && (
            <NavItem active={isActive('locationTypes')} href="/locationTypes" className="locationtypes-nav" onSelect={() => push('/locationTypes')}>Location Types</NavItem>
          )}
          {is_admin && (
            <NavItem active={isActive('promoCodes')} href="/promoCodes" className="promo-nav" onSelect={() => push('/promoCodes')}>PromoCodes</NavItem>
          )}
          {is_admin && (
            <NavItem active={isActive('users')} href="/users" className="users-nav" onSelect={() => push('/users')}>Users</NavItem>
          )}
          {is_partner && (
            <NavItem active={isActive('business')} href="/business" className="business-nav" onSelect={() => push('/business')}>Business Profile</NavItem>
          )}
          {is_partner && (
            <NavItem active={isActive('billing')} href="/billing" className="billing-nav" onSelect={() => push('/billing')}>Billing</NavItem>
          )}
          <NavItem active={isActive('profile')} href="/profile" className="profile-nav" onSelect={() => push('/profile')}>Settings</NavItem>
          <NavItem href="#" className="logout-nav" onSelect={() => {
            if (is_partner)
              push('/auth/signin');

            logoutUser();
          }}>Sign Out</NavItem>
        </ul>
      ) : (
        <ul className="nav metismenu">
          {icon}
          <NavItem active={isActive('signin')} href="/auth/signin" className="signin-nav" onSelect={() => push('/auth/signin')}>Sign In</NavItem>
          <NavItem active={isActive('signup')} href="/auth/signup" className="signup-nav" onSelect={() => push('/auth/signup')}>Sign Up</NavItem>
        </ul>
      )}
    </nav>
  );
}

export default Header;