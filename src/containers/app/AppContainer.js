/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Spinner } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  withRouter,
} from 'react-router';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import AppHeaderContainer from './AppHeaderContainer';
import OrgContainer from '../orgs/OrgContainer';
import OrgsContainer from '../orgs/OrgsContainer';
import * as AppActions from './AppActions';
import * as Routes from '../../core/router/Routes';
import {
  APP_CONTAINER_MAX_WIDTH,
  APP_CONTAINER_WIDTH,
  APP_CONTENT_PADDING
} from '../../core/style/Sizes';

const { INITIALIZE_APPLICATION } = AppActions;

// TODO: this should come from lattice-ui-kit, maybe after the next release. current version v0.1.1
const APP_CONTENT_BG :string = '#f8f8fb';

const AppContainerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0;
  min-width: ${APP_CONTAINER_WIDTH}px;
  padding: 0;
`;

const AppContentOuterWrapper = styled.main`
  background-color: ${APP_CONTENT_BG};
  display: flex;
  flex: 1 0 auto;
  justify-content: center;
  position: relative;
`;

const AppContentInnerWrapper = styled.div`
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  justify-content: flex-start;
  max-width: ${APP_CONTAINER_MAX_WIDTH}px;
  padding: ${APP_CONTENT_PADDING}px;
  position: relative;
  width: ${APP_CONTAINER_WIDTH}px;
`;

const Error = styled.div`
  text-align:center;
`;

type Props = {
  actions :{
    initializeApplication :RequestSequence;
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

  renderAppContent = () => {

    const { requestStates } = this.props;

    if (requestStates[INITIALIZE_APPLICATION] === RequestStates.SUCCESS) {
      return (
        <Switch>
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

    return (
      <AppContainerWrapper>
        <AppHeaderContainer />
        <AppContentOuterWrapper>
          <AppContentInnerWrapper>
            { this.renderAppContent() }
          </AppContentInnerWrapper>
        </AppContentOuterWrapper>
      </AppContainerWrapper>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => ({
  requestStates: {
    [INITIALIZE_APPLICATION]: state.getIn(['app', INITIALIZE_APPLICATION, 'requestState']),
  }
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    initializeApplication: AppActions.initializeApplication,
  }, dispatch)
});

// $FlowFixMe
export default withRouter(
  connect(mapStateToProps, mapActionsToProps)(AppContainer)
);
