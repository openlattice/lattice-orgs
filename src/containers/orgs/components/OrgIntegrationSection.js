/*
 * @flow
 */

import React, { Component } from 'react';

import { Map, fromJS } from 'immutable';
import { Form } from 'lattice-fabricate';
import {
  Button,
  CopyButton,
  Input,
  Modal,
} from 'lattice-ui-kit';

import DBMSTypes from '../../../utils/integration-config/DBMSTypes';
import { ActionControlWithButton } from './styled';
import { SectionGrid } from '../../../components';
import { isNonEmptyString } from '../../../utils/LangUtils';
import { generateIntegrationConfigFile } from '../../../utils/integration-config/IntegrationConfigUtils';

const dataSchema = {
  properties: {
    fields: {
      properties: {
        targetServer: {
          title: 'Target Server',
          type: 'string',
        },
        targetDatabase: {
          title: 'Target Database',
          type: 'string',
        },
        targetDBMS: {
          enum: Object.keys(DBMSTypes),
          title: 'Target DBMS',
          type: 'string',
        },
        targetPort: {
          title: 'Target Port',
          type: 'number',
        },
      },
      title: '',
      type: 'object',
    },
  },
  title: '',
  type: 'object',
};

const uiSchema = {
  fields: {
    classNames: 'column-span-12',
  }
};

const INITIAL_FORM_DATA = fromJS({
  fields: {
    targetDBMS: '',
    targetDatabase: '',
    targetPort: 5432,
    targetServer: '',
  }
});

type FormData = {
  fields :{
    targetDBMS :?string;
    targetDatabase :?string;
    targetPort :?number;
    targetServer :?string;
  };
};

type Props = {
  isOwner :boolean;
  org :Map;
};

type State = {
  formData :Map;
  isVisibleGenerateConfigModal :boolean;
};

class OrgIntegrationSection extends Component<Props, State> {

  constructor(props :Props) {

    super(props);

    this.state = {
      formData: INITIAL_FORM_DATA,
      isVisibleGenerateConfigModal: false,
    };
  }

  handleOnChangeForm = ({ formData } :{ formData :FormData }) => {

    const { formData: stateFormData } = this.state;

    let newFormData = fromJS(formData);
    if (isNonEmptyString(formData.fields.targetDBMS)) {
      if (stateFormData.getIn(['fields', 'targetDBMS']) !== newFormData.getIn(['fields', 'targetDBMS'])) {
        const dbms :Object = DBMSTypes[formData.fields.targetDBMS];
        newFormData = newFormData.setIn(['fields', 'targetPort'], dbms.port);
      }
    }

    this.setState({ formData: newFormData });
  }

  handleOnClickCopyCredential = () => {

    const { isOwner, org } = this.props;

    if (isOwner) {
      // TODO: consider using https://github.com/zenorocha/clipboard.js
      if (navigator.clipboard) {
        navigator.clipboard.writeText(org.getIn(['integration', 'credential'], ''));
      }
    }
  }

  handleOnClickGenerate = () => {

    const { org } = this.props;
    const { formData } = this.state;

    generateIntegrationConfigFile({
      orgId: org.get('id'),
      orgName: org.get('title'),
      orgPassword: org.getIn(['integration', 'credential']),
      orgUsername: org.getIn(['integration', 'user']),
      targetDatabase: formData.getIn(['fields', 'targetDatabase']),
      targetPort: formData.getIn(['fields', 'targetPort']),
      targetServer: formData.getIn(['fields', 'targetServer']),
      targetDBMS: formData.getIn(['fields', 'targetDBMS']),
    });
  }

  closeModal = () => {

    this.setState({
      formData: INITIAL_FORM_DATA,
      isVisibleGenerateConfigModal: false,
    });
  }

  openModal = () => {

    this.setState({
      isVisibleGenerateConfigModal: true,
    });
  }

  renderGenerateConfigModal = () => {

    const { formData, isVisibleGenerateConfigModal } = this.state;

    return (
      <Modal
          isVisible={isVisibleGenerateConfigModal}
          onClickPrimary={this.handleOnClickGenerate}
          onClose={this.closeModal}
          textPrimary="Generate"
          textTitle="Generate Integration Configuration File"
          viewportScrolling>
        <Form
            formData={formData.toJS()}
            hideSubmit
            noPadding
            onChange={this.handleOnChangeForm}
            schema={dataSchema}
            uiSchema={uiSchema} />
      </Modal>
    );
  }
renderDatabaseUrl = () => {
  const { org } = this.props;
  const orgIdClean = org.get('id').replace(/-/g, '');

  return (
    <SectionGrid>
      <h2>Database Details</h2>
      <h5>JDBC URL</h5>
      <pre>{`jdbc:postgresql://atlas.openlattice.com:30001/org_${orgIdClean}`}</pre>
    </SectionGrid>
  );
};

renderDatabaseCredentials = () => {
  const { isOwner, org } = this.props;

  if (!isOwner) {
    return null;
  }

  const integration: Map = org.get('integration', Map());  
  if (integration.isEmpty()) {
    return null;
  }

  return (
    <>
      <SectionGrid>
        <h5>USER</h5>
        <pre>{org.getIn(['integration', 'user'], '')}</pre>
        <h5>CREDENTIAL</h5>
      </SectionGrid>
      <SectionGrid columns={2}>
        <div style={{ marginTop: '4px' }}>
          <ActionControlWithButton>
            <Input
                disabled
                type="password"
                value="********************************"
            />
            <CopyButton onClick={this.handleOnClickCopyCredential} />
          </ActionControlWithButton>
        </div>
      </SectionGrid>
      <SectionGrid columns={2}>
        <div>
          <Button mode="primary" onClick={this.openModal}>
            Generate Integration Configuration File
          </Button>
        </div>
      </SectionGrid>
      {this.renderGenerateConfigModal()}
  </>
    );
};

render() {
  return (
    <>
    {this.renderDatabaseUrl()}
    {this.renderDatabaseCredentials()}
    </>
    );
  }
}

export default OrgIntegrationSection;
