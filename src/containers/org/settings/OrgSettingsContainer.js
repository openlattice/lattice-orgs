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
  Typography,
} from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  CopyButton,
  CrumbItem,
  CrumbLink,
  Crumbs,
  ElementWithButtonGrid,
  Pre,
} from '../../../components';
import { resetRequestState } from '../../../core/redux/actions';
import { INTEGRATION_ACCOUNTS, IS_OWNER, ORGANIZATIONS } from '../../../core/redux/constants';
import { selectOrganization } from '../../../core/redux/selectors';
import { Routes } from '../../../core/router';
import { clipboardWriteText } from '../../../utils';
import { DBMS_TYPES } from '../constants';
import { generateIntegrationConfig } from '../utils';

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
  organizationId :UUID;
};

const OrgSettingsContainer = ({ organizationId } :Props) => {

  const dispatch = useDispatch();
  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const [integrationConfigFormData, setIntegrationConfigFormData] = useState(INITIAL_FORM_DATA);
  const [isVisibleGenerateConfigModal, setIsVisibleGenerateConfigModal] = useState(false);

  const getIntegrationAccountRS :?RequestState = useRequestState([ORGANIZATIONS, GET_ORGANIZATION_INTEGRATION_ACCOUNT]);

  const isOwner :boolean = useSelector((s) => s.getIn([ORGANIZATIONS, IS_OWNER, organizationId]));
  const integrationAccount :?Map = useSelector((s) => s.getIn([ORGANIZATIONS, INTEGRATION_ACCOUNTS, organizationId]));
  const integrationCredential :string = get(integrationAccount, 'credential', '');
  const integrationUser :string = get(integrationAccount, 'user', '');

  const jdbcURL = useMemo(() => (
    `jdbc:postgresql://atlas.openlattice.com:30001/org_${organizationId.replace(/-/g, '')}`
  ), [organizationId]);

  const orgPath = useMemo(() => (
    Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  useEffect(() => {
    dispatch(
      getOrganizationIntegrationAccount(organizationId)
    );

    return () => dispatch(resetRequestState([GET_ORGANIZATION_INTEGRATION_ACCOUNT]));
  }, [dispatch, organizationId]);

  const handleOnClickGenerateIntegrationConfig = () => {

    if (organization) {
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
    }
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

  if (getIntegrationAccountRS === RequestStates.PENDING || getIntegrationAccountRS === RequestStates.STANDBY) {
    return (
      <AppContentWrapper>
        <Spinner size="2x" />
      </AppContentWrapper>
    );
  }

  return (
    <AppContentWrapper>
      <Crumbs>
        <CrumbLink to={orgPath}>{organization?.title || 'Organization'}</CrumbLink>
        <CrumbItem>Database</CrumbItem>
      </Crumbs>
      <Typography gutterBottom variant="h1">Database Details</Typography>
      <br />
      <Typography component="h2" variant="body2">Organization ID</Typography>
      <ElementWithButtonGrid fitContent>
        <Pre>{organizationId}</Pre>
        <CopyButton onClick={() => clipboardWriteText(organizationId)} />
      </ElementWithButtonGrid>
      <br />
      <Typography component="h2" variant="body2">JDBC URL</Typography>
      <ElementWithButtonGrid fitContent>
        <Pre>{jdbcURL}</Pre>
        <CopyButton onClick={() => clipboardWriteText(jdbcURL)} />
      </ElementWithButtonGrid>
      {
        isOwner && getIntegrationAccountRS === RequestStates.SUCCESS && (
          <>
            <br />
            <Typography component="h2" variant="body2">USER</Typography>
            <ElementWithButtonGrid fitContent>
              <Pre>{get(integrationAccount, 'user', '')}</Pre>
              <CopyButton onClick={() => clipboardWriteText(integrationUser)} />
            </ElementWithButtonGrid>
            <br />
            <Typography component="h2" variant="body2">CREDENTIAL</Typography>
            <ElementWithButtonGrid fitContent>
              <Input disabled type="password" value="********************************" />
              <CopyButton onClick={() => clipboardWriteText(integrationCredential)} />
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
