/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { AppContentWrapper, Typography } from 'lattice-ui-kit';
import { ReduxUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { Organization, Principal, UUID } from 'lattice';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Divider,
} from '../../../components';
import { selectOrganizationMembers } from '../../../core/redux/selectors';
import { Routes } from '../../../core/router';
import { getPrincipal } from '../../../utils';
import { getSecurablePrincipalId, getUserProfile } from '../../../utils/PersonUtils';
import { DataSetPermissionsContainer, PermissionsPanel } from '../components';
import type { UserProfile } from '../../../utils/PersonUtils';

const { selectOrganization } = ReduxUtils;

const getPanelColumnSize = ({ isVisiblePanelColumn }) => (
  isVisiblePanelColumn ? 'minmax(auto, 384px)' : 'auto'
);

const AppContentGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr ${getPanelColumnSize};
  height: 100%;
`;

const ContentColumn = styled.div`
  grid-column: 2 / 3;
`;

const PanelColumn = styled.div`
  grid-column-end: 4;
  height: 100%;
`;

const OrgMemberContainer = ({
  memberPrincipalId,
  organizationId,
} :{|
  memberPrincipalId :UUID;
  organizationId :UUID;
|}) => {

  const [selection, setSelection] = useState();

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const orgMembers :List<Map> = useSelector(selectOrganizationMembers(organizationId));

  const member :Map = useMemo(() => (
    orgMembers.find((orgMember :Map) => getSecurablePrincipalId(orgMember) === memberPrincipalId)
  ), [organization]);

  const memberUserProfile :UserProfile = useMemo(() => (
    getUserProfile(member)
  ), [member]);

  const memberPrincipal :?Principal = useMemo(() => (
    getPrincipal(member)
  ), [member]);

  const orgPath = useMemo(() => (
    Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  const membersPath = useMemo(() => (
    Routes.ORG_MEMBERS.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  if (organization && memberPrincipal) {

    // TODO: this will need to be more fancy
    const memberName = memberUserProfile.name || `${memberUserProfile.givenName} ${memberUserProfile.familyName}`;

    const handleOnClosePermissionsPanel = () => {
      setSelection();
    };

    return (
      <AppContentGrid isVisiblePanelColumn={!!selection}>
        <ContentColumn>
          <AppContentWrapper>
            <Crumbs>
              <CrumbLink to={orgPath}>{organization.title || 'Organization'}</CrumbLink>
              <CrumbLink to={membersPath}>Members</CrumbLink>
              <CrumbItem>{memberName}</CrumbItem>
            </Crumbs>
            <Typography gutterBottom variant="h1">{memberName}</Typography>
            <Typography variant="body1">These are the roles and data sets assigned to this member.</Typography>
            <Divider isVisible={false} margin={24} />
            <Typography gutterBottom variant="h2">Data Sets</Typography>
            <Typography variant="body1">Click on a data set to manage permissions.</Typography>
            <Divider isVisible={false} margin={8} />
            <DataSetPermissionsContainer
                organizationId={organizationId}
                onSelect={setSelection}
                principal={memberPrincipal}
                selection={selection} />
          </AppContentWrapper>
        </ContentColumn>
        {
          selection && (
            <PanelColumn>
              <PermissionsPanel
                  dataSetId={selection.dataSetId}
                  key={`${selection.dataSetId}-${selection.permissionType}`}
                  onClose={handleOnClosePermissionsPanel}
                  principal={memberPrincipal}
                  permissionType={selection.permissionType} />
            </PanelColumn>
          )
        }
      </AppContentGrid>
    );
  }

  return null;
};

export default OrgMemberContainer;
