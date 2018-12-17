/*
 * @flow
 */

import React from 'react';

import { Map } from 'immutable';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Redirect } from 'react-router-dom';

// import Logger from '../../utils/Logger';
import * as Routes from '../../core/router/Routes';
import { isValidUUID } from '../../utils/ValidationUtils';

// const LOG = new Logger('OrgsContainer');

type Props = {
  selectedOrganizationId :UUID;
};

const OrgsContainer = (props :Props) => {

  const { selectedOrganizationId } = props;
  if (isValidUUID(selectedOrganizationId)) {
    return (
      <Redirect to={Routes.ORG.replace(':id', selectedOrganizationId)} />
    );
  }

  return (
    <Redirect to={Routes.ROOT} />
  );
};

const mapStateToProps = (state :Map<*, *>) => ({
  selectedOrganizationId: state.getIn(['orgs', 'selectedOrganizationId']),
});

// $FlowFixMe
export default withRouter(
  connect(mapStateToProps)(OrgsContainer)
);
