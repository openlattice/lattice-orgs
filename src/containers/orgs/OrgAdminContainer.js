/*
 * @flow
 */

import React from 'react';

import { Map } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import { Card, CardSegment } from 'lattice-ui-kit';
import { ValidationUtils } from 'lattice-utils';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import type { UUID } from 'lattice';
import type { Match } from 'react-router';

import { OrgConnectionsSection } from './components';

import * as Routes from '../../core/router/Routes';
import { getIdFromMatch } from '../../core/router/RouterUtils';

const { isValidUUID } = ValidationUtils;

type Props = {
  isOwner :boolean;
  match :Match;
  org :Map;
};

const OrgAdminContainer = (props :Props) => {

  const { isOwner, match, org } = props;

  if (!AuthUtils.isAdmin()) {
    const orgId :?UUID = getIdFromMatch(match);
    if (orgId && isValidUUID(orgId)) {
      return <Redirect to={Routes.ORG.replace(Routes.ID_PARAM, orgId)} />;
    }
    return <Redirect to={Routes.ROOT} />;
  }

  return (
    <Card>
      <CardSegment noBleed>
        <OrgConnectionsSection isOwner={isOwner} org={org} />
      </CardSegment>
    </Card>
  );
};

const mapStateToProps = (state :Map, props :Object) => {

  const orgId :?UUID = getIdFromMatch(props.match);

  return {
    isOwner: state.hasIn(['orgs', 'isOwnerOfOrgIds', orgId], false),
    org: state.getIn(['orgs', 'orgs', orgId], Map()),
    orgs: state.getIn(['orgs', 'orgs'], Map()),
  };
};

// $FlowFixMe
export default connect(mapStateToProps)(OrgAdminContainer);
