/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';
import { Map, fromJS, get } from 'immutable';
import { Form } from 'lattice-fabricate';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  AppContentWrapper,
  Button,
  Input,
  Modal,
  Spinner,
} from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { DBMS_TYPES } from './constants';
import { generateIntegrationConfig } from './utils';

import { CopyButton, ElementWithButtonGrid, Header } from '../../components';
import { INTEGRATION_ACCOUNTS, ORGANIZATIONS } from '../../core/redux/constants';

const { GET_ORGANIZATION_INTEGRATION_ACCOUNT, getOrganizationIntegrationAccount } = OrganizationsApiActions;

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
          enum: Object.keys(DBMS_TYPES),
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

const Pre = styled.pre`
  margin: 0;
  overflow-wrap: break-word;
  white-space: normal;
`;

const GenerateIntegrationConfigButton = styled(Button)`
  width: fit-content;
`;

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
  organization :Organization;
  organizationId :UUID;
};

const OrgSettingsContainer = ({ isOwner, organizationId, organization } :Props) => {

  const dispatch = useDispatch();

  const [integrationConfigFormData, setIntegrationConfigFormData] = useState(INITIAL_FORM_DATA);
  const [isVisibleGenerateConfigModal, setIsVisibleGenerateConfigModal] = useState(false);

  const getIntegrationAccountRS :?RequestState = useRequestState([ORGANIZATIONS, GET_ORGANIZATION_INTEGRATION_ACCOUNT]);

  const integrationAccount :?Map = useSelector((s) => s.getIn([ORGANIZATIONS, INTEGRATION_ACCOUNTS, organizationId]));
  const integrationCredential :string = get(integrationAccount, 'credential', '');
  const integrationUser :string = get(integrationAccount, 'user', '');

  const jdbcURL = useMemo(() => (
    `jdbc:postgresql://atlas.openlattice.com:30001/org_${organizationId.replace(/-/g, '')}`
  ), [organizationId]);

  useEffect(() => {
    dispatch(
      getOrganizationIntegrationAccount(organizationId)
    );
  }, [dispatch, organizationId]);

  const handleOnClickCopy = (value :string) => {
    if (isOwner) {
      // TODO: consider using https://github.com/zenorocha/clipboard.js
      if (navigator.clipboard) {
        navigator.clipboard.writeText(value);
      }
    }
  };

  const handleOnClickGenerateIntegrationConfig = () => {
    generateIntegrationConfig({
      orgId: organizationId,
      orgName: organization.title,
      orgPassword: integrationCredential,
      orgUsername: integrationUser,
      targetDatabase: integrationConfigFormData.getIn(['fields', 'targetDatabase']),
      targetPort: integrationConfigFormData.getIn(['fields', 'targetPort']),
      targetServer: integrationConfigFormData.getIn(['fields', 'targetServer']),
      targetDBMS: integrationConfigFormData.getIn(['fields', 'targetDBMS']),
    });
  };

  const closeGenerateConfigModal = () => {
    setIntegrationConfigFormData(INITIAL_FORM_DATA);
    setIsVisibleGenerateConfigModal(false);
  };

  const openGenerateConfigModal = () => {
    setIsVisibleGenerateConfigModal(true);
  };

  const handleOnChangeIntegrationConfigForm = ({ formData } :{ formData :FormData }) => {
    let newFormData = fromJS(formData);
    const targetDBMS :?string = newFormData.getIn(['fields', 'targetDBMS']);
    if (targetDBMS && DBMS_TYPES[targetDBMS]) {
      const dbms = DBMS_TYPES[targetDBMS];
      newFormData = newFormData.setIn(['fields', 'targetPort'], dbms.port);
    }
    setIntegrationConfigFormData(newFormData);
  };

  if (getIntegrationAccountRS === RequestStates.PENDING) {
    return (
      <AppContentWrapper>
        <Spinner size="2x" />
      </AppContentWrapper>
    );
  }

  return (
    <AppContentWrapper>
      <Header as="h3">Database Details</Header>
      <br />
      <Header as="h5">Organization ID</Header>
      <ElementWithButtonGrid fitContent>
        <Pre>{organizationId}</Pre>
        <CopyButton onClick={() => handleOnClickCopy(organizationId)} />
      </ElementWithButtonGrid>
      <br />
      <Header as="h5">JDBC URL</Header>
      <ElementWithButtonGrid fitContent>
        <Pre>{jdbcURL}</Pre>
        <CopyButton onClick={() => handleOnClickCopy(jdbcURL)} />
      </ElementWithButtonGrid>
      {
        isOwner && getIntegrationAccountRS === RequestStates.SUCCESS && (
          <>
            <br />
            <Header as="h5">USER</Header>
            <ElementWithButtonGrid fitContent>
              <Pre>{get(integrationAccount, 'user', '')}</Pre>
              <CopyButton onClick={() => handleOnClickCopy(integrationUser)} />
            </ElementWithButtonGrid>
            <br />
            <Header as="h5">CREDENTIAL</Header>
            <ElementWithButtonGrid fitContent>
              <Input disabled type="password" value="********************************" />
              <CopyButton onClick={() => handleOnClickCopy(integrationCredential)} />
            </ElementWithButtonGrid>
            <br />
            <GenerateIntegrationConfigButton onClick={openGenerateConfigModal}>
              Generate Integration Config
            </GenerateIntegrationConfigButton>
            <Modal
                isVisible={isVisibleGenerateConfigModal}
                onClickPrimary={handleOnClickGenerateIntegrationConfig}
                onClose={closeGenerateConfigModal}
                textPrimary="Generate"
                textTitle="Generate Integration Configuration File"
                viewportScrolling>
              <Form
                  formData={integrationConfigFormData.toJS()}
                  hideSubmit
                  noPadding
                  onChange={handleOnChangeIntegrationConfigForm}
                  schema={dataSchema}
                  uiSchema={uiSchema} />
            </Modal>
          </>
        )
      }
    </AppContentWrapper>
  );
};

export default OrgSettingsContainer;
