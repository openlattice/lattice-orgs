/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

// import Logger from '../../utils/Logger';

const Description = styled.h2`
  font-size: 15px;
  font-weight: normal;
  line-height: normal;
  margin: 0;
`;

type Props = {
  organization :Map;
};

class OrgDescriptionSectionContainer extends Component<Props> {

  render() {

    const { organization } = this.props;

    return (
      <>
        <Description>{organization.get('description')}</Description>
      </>
    );
  }
}

// $FlowFixMe
export default withRouter(
  connect()(OrgDescriptionSectionContainer)
);
