/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

// import Logger from '../../utils/Logger';

const Title = styled.h1`
  font-size: 20px;
  font-weight: normal;
  line-height: normal;
  margin: 0;
  margin-bottom: 20px;
`;

type Props = {
  organization :Map;
};

class OrgTitleSectionContainer extends Component<Props> {

  render() {

    const { organization } = this.props;

    return (
      <>
        <Title>{organization.get('title')}</Title>
      </>
    );
  }
}

// $FlowFixMe
export default withRouter(
  connect()(OrgTitleSectionContainer)
);
