/*
 * @flow
 */

import React, { Component } from 'react';

import { List, Map } from 'immutable';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

// import Logger from '../../utils/Logger';
import OrgDescriptionSectionContainer from './OrgDescriptionSectionContainer';
import OrgTitleSectionContainer from './OrgTitleSectionContainer';
import Spinner from '../../../components/spinner/Spinner';
import * as OrgsActions from '../OrgsActions';

type Props = {
  isFetchingAllOrganizations :boolean;
  organization :Map;
};

class OrgOverviewContainer extends Component<Props> {

  render() {

    const { isFetchingAllOrganizations, organization } = this.props;

    if (isFetchingAllOrganizations || !organization) {
      return (
        <Spinner />
      );
    }

    return (
      <>
        <OrgTitleSectionContainer organization={organization} />
        <OrgDescriptionSectionContainer organization={organization} />
      </>
    );
    // { this.renderDomainsSection() }
    // { this.renderRolesSection() }
    // { this.renderMembersSection() }
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
  })(OrgOverviewContainer)
);
