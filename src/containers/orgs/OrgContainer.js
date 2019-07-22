/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import { Spinner } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import Logger from '../../utils/Logger';

const LOG = new Logger('OrgContainer');

const Title = styled.h1`
  font-size: 28px;
  font-weight: normal;
  margin: 20px 0 40px 0;
  padding: 0;
`;

type Props = {
  actions :{
    getOrganization :RequestSequence;
  };
  getOrgRequestState :RequestState;
  org :Map;
  orgId :UUID;
};

class OrgContainer extends Component<Props> {

  componentDidMount() {

    const { actions, org, orgId } = this.props;
    if (!org || org.isEmpty()) {
      actions.getOrganization(orgId);
    }
  }

  componentDidUpdate(prevProps :Props) {

    const { actions, orgId } = this.props;
    if (orgId !== prevProps.orgId) {
      actions.getOrganization(orgId);
    }
  }

  render() {

    const { getOrgRequestState, org } = this.props;

    if (getOrgRequestState === RequestStates.PENDING) {
      return (
        <Spinner size="2x" />
      );
    }

    return (
      <Title>{org.get('title')}</Title>
    );
  }
}

const mapStateToProps = (state :Map<*, *>, props) => {

  const {
    params: {
      id: orgId = null,
    } = {},
  } = props.match;

  return {
    orgId,
    getOrgRequestState: state.getIn(['orgs', OrganizationsApiActions.GET_ORGANIZATION, 'requestState']),
    org: state.getIn(['orgs', 'orgs', orgId], Map()),
  };
};

const mapDispatchToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    getOrganization: OrganizationsApiActions.getOrganization,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(OrgContainer);
