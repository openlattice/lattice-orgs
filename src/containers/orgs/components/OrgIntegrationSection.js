/*
 * @flow
 */

import React, { Component } from 'react';

import { Map, fromJS } from 'immutable';
import { Form } from 'lattice-fabricate';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  ActionModal,
  Button,
  Input,
  Label,
  Modal,
} from 'lattice-ui-kit';
import { LangUtils } from 'lattice-utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { ActionControlWithButton } from './styled';

import DBMSTypes from '../../../utils/integration-config/DBMSTypes';
import * as ReduxActions from '../../../core/redux/ReduxActions';
import {
  CopyButton,
  EditButton,
  ModalBodyMinWidth,
  SectionGrid,
} from '../../../components';
import { generateIntegrationConfigFile } from '../../../utils/integration-config/IntegrationConfigUtils';
import type { ResetRequestStateAction } from '../../../core/redux/ReduxActions';

const { isNonEmptyString } = LangUtils;
const { RENAME_ORGANIZATION_DATABASE } = OrganizationsApiActions;

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
  actions :{
    renameOrganizationDatabase :RequestSequence;
    resetRequestState :ResetRequestStateAction;
  };
  isOwner :boolean;
  org :Map;
  requestStates :{
    RENAME_ORGANIZATION_DATABASE :RequestState;
  };
};

type State = {
  formData :Map;
  isValidDatabaseName :boolean;
  isVisibleGenerateConfigModal :boolean;
  isVisibleDatabaseNameModal :boolean;
  newDatabaseName :string;
};

class OrgIntegrationSection extends Component<Props, State> {

  constructor(props :Props) {

    super(props);

    this.state = {
      formData: INITIAL_FORM_DATA,
      isValidDatabaseName: true,
      isVisibleDatabaseNameModal: false,
      isVisibleGenerateConfigModal: false,
      newDatabaseName: '',
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

  handleOnChangeNewDatabaseName = (event :SyntheticInputEvent<HTMLInputElement>) => {

    this.setState({
      isValidDatabaseName: true,
      newDatabaseName: event.target.value || '',
    });
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

  handleOnClickRenameDatabase = () => {

    this.setState({
      isVisibleDatabaseNameModal: true,
    });
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

  closeDatabaseNameModal = () => {

    const { actions } = this.props;

    this.setState({
      isVisibleDatabaseNameModal: false,
      newDatabaseName: '',
    });
    actions.resetRequestState(RENAME_ORGANIZATION_DATABASE);
  }

  openModal = () => {

    this.setState({
      isVisibleGenerateConfigModal: true,
    });
  }

  renameDatabase = () => {

    const { actions, org } = this.props;
    const { newDatabaseName } = this.state;

    if (isNonEmptyString(newDatabaseName)) {
      actions.renameOrganizationDatabase({ organizationId: org.get('id'), databaseName: newDatabaseName });
    }
    else {
      this.setState({
        isValidDatabaseName: false,
      });
    }
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

    const { isOwner, org } = this.props;
    const orgId = org.get('id');
    const databaseName = org.get('databaseName');

    return (
      <SectionGrid>
        <h2>Database Details</h2>
        <h5>Organization ID</h5>
        <pre>{orgId}</pre>
        <h5>Database Name</h5>
        {
          isOwner
            ? (
              <SectionGrid columns={2}>
                <div style={{ marginTop: '4px' }}>
                  <ActionControlWithButton>
                    <pre>{databaseName}</pre>
                    <EditButton onClick={this.handleOnClickRenameDatabase} />
                  </ActionControlWithButton>
                </div>
              </SectionGrid>
            )
            : (
              <pre>{databaseName}</pre>
            )
        }
        <h5>JDBC URL</h5>
        <pre>{`jdbc:postgresql://atlas.openlattice.com:30001/${databaseName}`}</pre>
      </SectionGrid>
    );
  }

  renderDatabaseCredentials = () => {
    const { isOwner, org } = this.props;

    if (!isOwner) {
      return null;
    }

    const integration :Map = org.get('integration', Map());
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
              <Input disabled type="password" value="********************************" />
              <CopyButton onClick={this.handleOnClickCopyCredential} />
            </ActionControlWithButton>
          </div>
        </SectionGrid>
        <SectionGrid columns={2}>
          <div>
            <Button onClick={this.openModal}>Generate Integration Configuration File</Button>
          </div>
        </SectionGrid>
        {this.renderGenerateConfigModal()}
      </>
    );
  }

  renderNewOrgModal = () => {

    const { requestStates } = this.props;
    const { isValidDatabaseName, isVisibleDatabaseNameModal, newDatabaseName } = this.state;

    const requestStateComponents = {
      [RequestStates.STANDBY]: (
        <ModalBodyMinWidth>
          <Label htmlFor="new-database-name">Database Name*</Label>
          <Input
              id="new-database-name"
              error={!isValidDatabaseName}
              onChange={this.handleOnChangeNewDatabaseName}
              value={newDatabaseName} />
        </ModalBodyMinWidth>
      ),
      [RequestStates.FAILURE]: (
        <ModalBodyMinWidth>
          <span>Failed to rename the database. Please try again.</span>
        </ModalBodyMinWidth>
      ),
    };

    return (
      <ActionModal
          isVisible={isVisibleDatabaseNameModal}
          onClickPrimary={this.renameDatabase}
          onClose={this.closeDatabaseNameModal}
          requestState={requestStates[RENAME_ORGANIZATION_DATABASE]}
          requestStateComponents={requestStateComponents}
          textPrimary="Submit"
          textSecondary="Cancel"
          textTitle="Rename Database" />
    );
  }

  render() {

    return (
      <>
        {this.renderDatabaseUrl()}
        {this.renderDatabaseCredentials()}
        {this.renderNewOrgModal()}
      </>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  requestStates: {
    [RENAME_ORGANIZATION_DATABASE]: state.getIn(['orgs', RENAME_ORGANIZATION_DATABASE, 'requestState']),
  },
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    renameOrganizationDatabase: OrganizationsApiActions.renameOrganizationDatabase,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgIntegrationSection);
