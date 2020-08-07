/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import styled from 'styled-components';
import { faTrash } from '@fortawesome/pro-light-svg-icons';
import { faPlus } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Set } from 'immutable';
import { Types } from 'lattice';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  AppContentWrapper,
  Card,
  CardStack,
  IconButton,
  Input,
} from 'lattice-ui-kit';
import { LangUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Organization, Role, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ADD_ROLE_TO_ORGANIZATION, REMOVE_ROLE_FROM_ORGANIZATION } from './OrgsActions';
import { AddOrRemoveOrgRoleModal } from './components';

import { Header, SpaceBetweenCardSegment } from '../../components';

const { ActionTypes } = Types;
const { isNonEmptyString } = LangUtils;

const FormGrid = styled.form`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 1fr auto;
`;

type Props = {
  isOwner :boolean;
  organization :Organization;
  organizationId :UUID;
};

const OrgRolesContainer = ({ isOwner, organization, organizationId } :Props) => {

  const [addOrRemoveOrgRoleAction, setAddOrRemoveOrgRoleAction] = useState();
  const [isValidRoleTitle, setIsValidRoleTitle] = useState(true);
  const [isVisibleAddOrRemoveOrgRoleModal, setIsVisibleAddOrRemoveOrgRoleModal] = useState(false);
  const [roleTitle, setRoleTitle] = useState('');
  const [roleToRemove, setRoleToRemove] = useState();

  const roleTitlesSet :Set<string> = useMemo(() => (
    Set(organization.roles.map((role :Role) => role.title))
  ), [organization]);

  const handleOnChangeRoleTitle = (event :SyntheticInputEvent<HTMLInputElement>) => {

    event.stopPropagation();

    const newRoleTitle = event.target.value || '';
    setRoleTitle(newRoleTitle);
    setIsValidRoleTitle(!roleTitlesSet.has(newRoleTitle));
  };

  const handleOnClickAddRole = () => {

    if (isVisibleAddOrRemoveOrgRoleModal) {
      // don't open modal while another modal is open, which can happen via keyboard tabbing in the bg
      return;
    }

    if (isOwner) {
      if (isNonEmptyString(roleTitle) && !roleTitlesSet.has(roleTitle)) {
        setAddOrRemoveOrgRoleAction(ActionTypes.ADD);
        setIsVisibleAddOrRemoveOrgRoleModal(true);
      }
      else {
        setIsValidRoleTitle(false);
      }
    }
  };

  const handleOnClickRemoveRole = (role :Role) => {

    if (isVisibleAddOrRemoveOrgRoleModal) {
      // don't open modal while another modal is open, which can happen via keyboard tabbing in the bg
      return;
    }

    if (isOwner) {
      setAddOrRemoveOrgRoleAction(ActionTypes.REMOVE);
      setIsVisibleAddOrRemoveOrgRoleModal(true);
      setRoleToRemove(role);
    }
  };

  const closeAddOrRemoveOrgRoleModal = () => {
    setAddOrRemoveOrgRoleAction();
    setIsVisibleAddOrRemoveOrgRoleModal(false);
    setRoleToRemove();
  };

  return (
    <AppContentWrapper>
      <Header as="h3">Roles</Header>
      <CardStack>
        <div>
          <FormGrid>
            <Input
                error={!isValidRoleTitle}
                onChange={handleOnChangeRoleTitle}
                placeholder="Add a new role" />
            <IconButton isLoading={false} onClick={handleOnClickAddRole} type="submit">
              <FontAwesomeIcon fixedWidth icon={faPlus} />
            </IconButton>
          </FormGrid>
        </div>
        {
          organization.roles.map((role :Role) => (
            <Card key={role.id}>
              <SpaceBetweenCardSegment vertical={false}>
                <span>{role.title}</span>
                {
                  isOwner && (
                    <IconButton color="error" disabled={!isOwner} onClick={() => handleOnClickRemoveRole(role)}>
                      <FontAwesomeIcon fixedWidth icon={faTrash} />
                    </IconButton>
                  )
                }
              </SpaceBetweenCardSegment>
            </Card>
          ))
        }
      </CardStack>
      {
        isVisibleAddOrRemoveOrgRoleModal && (
          <AddOrRemoveOrgRoleModal
              action={addOrRemoveOrgRoleAction}
              isOwner={isOwner}
              onClose={closeAddOrRemoveOrgRoleModal}
              organizationId={organizationId}
              roleId={roleToRemove ? roleToRemove.id : undefined}
              roleTitle={roleToRemove ? roleToRemove.title : roleTitle} />
        )
      }
    </AppContentWrapper>
  );
};

export default OrgRolesContainer;
