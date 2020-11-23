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

import DataSetPermissionsContainer from '../DataSetPermissionsContainer';
import MemberRolesContainer from '../MemberRolesContainer';
import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  StackGrid,
} from '../../../components';
import { selectOrganizationMembers } from '../../../core/redux/selectors';
import { Routes } from '../../../core/router';
import { getPrincipal } from '../../../utils';
import { getSecurablePrincipalId, getUserProfile } from '../../../utils/PersonUtils';
import { PermissionsPanel } from '../components';
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
  ), [orgMembers, memberPrincipalId]);

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
            <StackGrid gap={48}>
              <StackGrid>
                <Typography variant="h1">{memberName}</Typography>
                <Typography>
                  Below are all of the roles assigned to this member and data sets this member has permissions on.
                </Typography>
              </StackGrid>
              <StackGrid>
                <Typography variant="h2">Roles</Typography>
                <MemberRolesContainer
                    member={member}
                    organizationId={organizationId}
                    roles={organization?.roles} />
              </StackGrid>
              <StackGrid>
                <Typography variant="h2">Data Sets</Typography>
                <Typography>Click on a data set to manage this member&apos;s permissions.</Typography>
                <DataSetPermissionsContainer
                    organizationId={organizationId}
                    onSelect={setSelection}
                    principal={memberPrincipal}
                    selection={selection} />
              </StackGrid>
            </StackGrid>
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
