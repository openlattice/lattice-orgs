/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { AppContentWrapper, Modal, Typography } from 'lattice-ui-kit';
import { ReduxUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { Organization, Principal, UUID } from 'lattice';

import MemberRolesContainer from '../MemberRolesContainer';
import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  StackGrid,
  StepsController,
} from '../../../components';
import { selectOrganizationMembers } from '../../../core/redux/selectors';
import { getPrincipal } from '../../../utils';
import { getSecurablePrincipalId, getUserProfile } from '../../../utils/PersonUtils';
import { DataSetPermissionsContainer, PermissionsActionsGrid } from '../../permissions';
import { AssignPermissionsToDataSet, PermissionsPanel } from '../components';
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
  membersRoute,
  organizationId,
  organizationRoute,
} :{|
  memberPrincipalId :UUID;
  membersRoute :string;
  organizationId :UUID;
  organizationRoute :string;
|}) => {

  const [filterByPermissionTypes, setFilterByPermissionTypes] = useState([]);
  const [filterByQuery, setFilterByQuery] = useState('');
  const [isVisibleAddDataSetModal, setIsVisibleAddDataSetModal] = useState(false);
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

  if (organization && memberPrincipal) {

    // TODO: this will need to be more fancy
    const memberName = memberUserProfile.name || `${memberUserProfile.givenName} ${memberUserProfile.familyName}`;

    const handleOnClosePermissionsPanel = () => {
      setSelection();
    };

    return (
      <>
        <AppContentGrid isVisiblePanelColumn={!!selection}>
          <ContentColumn>
            <AppContentWrapper>
              <Crumbs>
                <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
                <CrumbLink to={membersRoute}>Members</CrumbLink>
                <CrumbItem>{memberName}</CrumbItem>
              </Crumbs>
              <StackGrid gap={24}>
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
                  <Typography>Click on a dataset to manage permissions.</Typography>
                </StackGrid>
                <PermissionsActionsGrid
                    assignPermissionsText="Add dataset"
                    onChangeFilterByPermissionTypes={setFilterByPermissionTypes}
                    onChangeFilterByQuery={setFilterByQuery}
                    onClickAssignPermissions={() => setIsVisibleAddDataSetModal(true)} />
                <DataSetPermissionsContainer
                    filterByPermissionTypes={filterByPermissionTypes}
                    filterByQuery={filterByQuery}
                    organizationId={organizationId}
                    onSelect={setSelection}
                    principal={memberPrincipal}
                    selection={selection} />
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
        <Modal
            isVisible={isVisibleAddDataSetModal}
            onClose={() => {}}
            shouldCloseOnOutsideClick={false}
            viewportScrolling
            withFooter={false}
            withHeader={false}>
          <StepsController>
            {
              ({ step, stepBack, stepNext }) => (
                <AssignPermissionsToDataSet
                    onClose={() => setIsVisibleAddDataSetModal(false)}
                    organizationId={organizationId}
                    principal={memberPrincipal}
                    step={step}
                    stepBack={stepBack}
                    stepNext={stepNext} />
              )
            }
          </StepsController>
        </Modal>
      </>
    );
  }

  return null;
};

export default OrgMemberContainer;
