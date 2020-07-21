/*
 * @flow
 */

import React, { Component } from 'react';

// import isFunction from 'lodash/isFunction';
import styled from 'styled-components';
import { Map } from 'immutable';
import { AuthActions, AuthUtils } from 'lattice-auth';
import {
  AppContainerWrapper,
  AppContentWrapper,
  AppHeaderWrapper,
  AppNavigationWrapper,
  LatticeLuxonUtils,
  MuiPickersUtilsProvider,
  Spinner,
  StylesProvider,
  ThemeProvider,
  lightTheme,
} from 'lattice-ui-kit';
import { LangUtils } from 'lattice-utils';
import { connect } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  withRouter,
} from 'react-router';
import { NavLink } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as AppActions from './AppActions';

import OpenLatticeIcon from '../../assets/svg/icons/ol-icon.svg';
import OrgContainer from '../orgs/OrgContainer';
import OrgsContainer from '../orgs/OrgsContainer';
import * as Routes from '../../core/router/Routes';
import { DataSetContainer } from '../data';

const { INITIALIZE_APPLICATION } = AppActions;
const { isNonEmptyString } = LangUtils;

const Error = styled.div`
  text-align: center;
`;

type Props = {
  actions :{
    initializeApplication :RequestSequence;
    logout :() => void;
  };
  requestStates :{
    INITIALIZE_APPLICATION :RequestState;
  };
};

class AppContainer extends Component<Props> {

  componentDidMount() {

    const { actions } = this.props;
    actions.initializeApplication();
  }

  logout = () => {

    const { actions } = this.props;
    actions.logout();
  }

  renderAppContent = () => {

    const { requestStates } = this.props;

    if (requestStates[INITIALIZE_APPLICATION] === RequestStates.SUCCESS) {
      return (
        <Switch>
          {/* HACK: this is hacky, gotta rewrite it */}
          <Route exact path={Routes.ORG_DATA_SETS} component={OrgContainer} />
          <Route exact path={Routes.ORG_ROLES} component={OrgContainer} />
          <Route exact path={Routes.ORG_PERMISSIONS} component={OrgContainer} />
          <Route exact path={Routes.ORG_ADMIN} component={OrgContainer} />
          <Route path={Routes.DATA_SET} component={DataSetContainer} />
          {/* END HACK */}
          <Route path={Routes.ORG} component={OrgContainer} />
          <Route path={Routes.ORGS} component={OrgsContainer} />
          <Redirect to={Routes.ORGS} />
        </Switch>
      );
    }

    if (requestStates[INITIALIZE_APPLICATION] === RequestStates.FAILURE) {
      return (
        <Error>
          Sorry, something went wrong. Please try refreshing the page, or contact support.
        </Error>
      );
    }

    return (
      <Spinner size="2x" />
    );
  }

  render() {

    const userInfo :Object = AuthUtils.getUserInfo() || {};
    let user = null;
    if (isNonEmptyString(userInfo.name)) {
      user = userInfo.name;
    }
    else if (isNonEmptyString(userInfo.email)) {
      user = userInfo.email;
    }

    return (
      <ThemeProvider theme={lightTheme}>
        <MuiPickersUtilsProvider utils={LatticeLuxonUtils}>
          <StylesProvider injectFirst>
            <AppContainerWrapper>
              <AppHeaderWrapper appIcon={OpenLatticeIcon} appTitle="Organizations" logout={this.logout} user={user}>
                <AppNavigationWrapper>
                  <NavLink to={Routes.ORGS} />
                </AppNavigationWrapper>
              </AppHeaderWrapper>
              <AppContentWrapper>
                { this.renderAppContent() }
              </AppContentWrapper>
            </AppContainerWrapper>
          </StylesProvider>
        </MuiPickersUtilsProvider>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  requestStates: {
    [INITIALIZE_APPLICATION]: state.getIn(['app', INITIALIZE_APPLICATION, 'requestState']),
  }
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    initializeApplication: AppActions.initializeApplication,
    logout: AuthActions.logout,
  }, dispatch)
});

// $FlowFixMe
export default withRouter(
  connect(mapStateToProps, mapActionsToProps)(AppContainer)
);
