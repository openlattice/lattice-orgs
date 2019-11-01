/*
 * @flow
 */

import React, { Component } from 'react';

import { Map } from 'immutable';
import { CopyButton, Input } from 'lattice-ui-kit';

import { ActionControlWithButton } from './styled';
import { SectionGrid } from '../../../components';

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
        <SectionGrid>
          <h2>Integration Account Details</h2>
          <h5>JDBC URL</h5>
          <pre>{`jdbc:postgresql://atlas.openlattice.com:30001/org_${orgIdClean}`}</pre>
          <h5>USER</h5>
          <pre>{org.getIn(['integration', 'user'], '')}</pre>
          <h5>CREDENTIAL</h5>
        </SectionGrid>
        <SectionGrid columns={2}>
          <div style={{ marginTop: '4px' }}>
            <ActionControlWithButton>
              <Input disabled type="password" value="********************************" />
              <CopyButton onClick={this.handleOnClickCopyCredential} />
            </ActionControlWithButton>
          </div>
        </SectionGrid>
      </>
    );
  }
}

export default OrgIntegrationSection;
