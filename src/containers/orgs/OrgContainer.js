/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

// import Logger from '../../utils/Logger';
import Spinner from '../../components/spinner/Spinner';
import * as OrgsActions from './OrgsActions';

// const LOG = new Logger('OrgContainer');

const RowWrapper = styled.div`
  display: flex;
`;

const AppWrapper = styled.div`
  border: 1px solid #e1e1eb;
  padding: 0 20px;
`;

const EntitySetsWrapper = styled.div`
  border: 1px solid #e1e1eb;
  border-left: none;
  padding: 0 20px;
`;

type Props = {
  getRelevantEntitySets :RequestSequence;
  isFetchingAllOrganizations :boolean;
  isFetchingRelevantEntitySets :boolean;
  organization :Map;
  relevantEntitySets :Map;
};

class OrgContainer extends Component<Props> {

  componentDidMount() {

    const { getRelevantEntitySets, organization } = this.props;
    if (organization && !organization.isEmpty()) {
      getRelevantEntitySets(organization);
    }
  }

  componentDidUpdate(prevProps :Props) {

    const { getRelevantEntitySets, organization } = this.props;
    const { organization: prevOrganization } = prevProps;
    if (organization && !organization.isEmpty() && !organization.equals(prevOrganization)) {
      getRelevantEntitySets(organization);
    }
  }

  renderEntitySets = () => {

    const { isFetchingRelevantEntitySets, relevantEntitySets } = this.props;
    if (isFetchingRelevantEntitySets || !relevantEntitySets) {
      return null;
    }

    const appIdToEntitySetIdsMap :Map<UUID, Set<UUID>> = relevantEntitySets.get('appIdToEntitySetIdsMap');
    if (!appIdToEntitySetIdsMap || appIdToEntitySetIdsMap.isEmpty()) {
      return null;
    }

    const appElements = [];

    appIdToEntitySetIdsMap.forEach((entitySetIds :Set<UUID>, appId :UUID) => {

      const esElements = [];
      entitySetIds.forEach((entitySetId :UUID) => (
        esElements.push(
          <p key={entitySetId}>{entitySetId}</p>
        )
      ));
      /* eslint-disable react/no-array-index-key */
      const wrapper = (
        <RowWrapper key={appId}>
          <AppWrapper>
            <p>App</p>
            <p>{appId}</p>
          </AppWrapper>
          <EntitySetsWrapper>
            <p>EntitySets</p>
            {esElements}
          </EntitySetsWrapper>
        </RowWrapper>
      );
      /* eslint-enable */
      appElements.push(wrapper);
    });

    return (
      <div>
        <h4>Relevant EntitySets</h4>
        {appElements}
      </div>
    );
  }

  render() {

    const { isFetchingAllOrganizations, organization } = this.props;

    if (isFetchingAllOrganizations || !organization) {
      return (
        <Spinner />
      );
    }

    console.log(organization.toJS());

    return (
      <>
        <h2>{organization.get('title')}</h2>
        <p>{organization.get('description')}</p>
        {this.renderEntitySets()}
      </>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => {

  const organizations :List = state.getIn(['orgs', 'organizations']);
  const selectedOrganizationId :UUID = state.getIn(['orgs', 'selectedOrganizationId']);
  const organization :Map = organizations.find((org :Map) => org.get('id') === selectedOrganizationId);

  return {
    organization,
    isFetchingAllOrganizations: state.getIn(['orgs', 'isFetchingAllOrganizations']),
    isFetchingRelevantEntitySets: state.getIn(['orgs', 'isFetchingRelevantEntitySets']),
    relevantEntitySets: state.getIn(['orgs', 'relevantEntitySets']),
  };
};

// $FlowFixMe
export default withRouter(
  connect(mapStateToProps, {
    getRelevantEntitySets: OrgsActions.getRelevantEntitySets,
  })(OrgContainer)
);
