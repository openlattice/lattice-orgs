/*
 * @flow
 */

import React, { Component } from 'react';

import { Map } from 'immutable';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

// import Logger from '../../utils/Logger';

// const LOG = new Logger('OrgContainer');

type Props = {
  selectedOrganizationId :UUID;
};

class OrgContainer extends Component<Props> {

  render() {

    const { selectedOrganizationId } = this.props;
    return (
      <p>{ selectedOrganizationId }</p>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => ({
  selectedOrganizationId: state.getIn(['orgs', 'selectedOrganizationId']),
});

// $FlowFixMe
export default withRouter(
  connect(mapStateToProps)(OrgContainer)
);
