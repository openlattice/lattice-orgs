/*
 * @flow
 */

import React, { Component } from 'react';

import { Map } from 'immutable';
import { CopyButton, Input } from 'lattice-ui-kit';

import ActionControlWithButton from './styled/ActionControlWithButton';
import OrgDetailSectionGrid from './styled/OrgDetailSectionGrid';
import OrgDetailSectionGridItem from './styled/OrgDetailSectionGridItem';

type Props = {
  isOwner :boolean;
  org :Map;
};

class OrgIntegrationSection extends Component<Props> {

  handleOnClickCopyCredential = () => {

    const { isOwner, org } = this.props;

    if (isOwner) {
      // TODO: consider using https://github.com/zenorocha/clipboard.js
      if (navigator.clipboard) {
        navigator.clipboard.writeText(org.getIn(['integration', 'credential'], ''));
      }
    }
  }

  render() {

    const { org } = this.props;
    const orgIdClean = org.get('id').replace(/-/g, '');

    return (
      <>
        <OrgDetailSectionGrid>
          <h2>Integration Account Details</h2>
          <h5>JDBC URL</h5>
          <pre>{`jdbc:postgresql://atlas.openlattice.com:30001/org_${orgIdClean}`}</pre>
          <h5>USER</h5>
          <pre>{org.getIn(['integration', 'user'], '')}</pre>
          <h5>CREDENTIAL</h5>
        </OrgDetailSectionGrid>
        <OrgDetailSectionGrid columns={2}>
          <OrgDetailSectionGridItem marginTop={4}>
            <ActionControlWithButton>
              <Input disabled type="password" value="********************************" />
              <CopyButton onClick={this.handleOnClickCopyCredential} />
            </ActionControlWithButton>
          </OrgDetailSectionGridItem>
        </OrgDetailSectionGrid>
      </>
    );
  }
}

export default OrgIntegrationSection;
