/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import { faTrash } from '@fortawesome/pro-light-svg-icons';
import { faPlus } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Set } from 'immutable';
import { Types } from 'lattice';
import {
  AppContentWrapper,
  Card,
  CardStack,
  IconButton,
  Input,
} from 'lattice-ui-kit';
import { LangUtils } from 'lattice-utils';
import type { Organization, Role, UUID } from 'lattice';

import { AddOrRemoveOrgRoleModal } from './components';

import { ElementWithButtonGrid, Header, SpaceBetweenCardSegment } from '../../components';

const { ActionTypes } = Types;
const { isNonEmptyString } = LangUtils;

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
    const newRoleTitle = event.target.value || '';
    setRoleTitle(newRoleTitle);
    setIsValidRoleTitle(!roleTitlesSet.has(newRoleTitle));
  };

  const handleOnSubmitAddRole = (event :SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
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
      <form onSubmit={handleOnSubmitAddRole}>
        <ElementWithButtonGrid>
          <Input
              error={!isValidRoleTitle}
              onChange={handleOnChangeRoleTitle}
              placeholder="Add a new role" />
          <IconButton isLoading={false} type="submit">
            <FontAwesomeIcon fixedWidth icon={faPlus} />
          </IconButton>
        </ElementWithButtonGrid>
      </form>
      <br />
      <CardStack>
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
