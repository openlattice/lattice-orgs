/*
 * @flow
 */

import React, { useMemo } from 'react';

import { faTrash } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  List,
  Map,
  get,
  getIn,
} from 'immutable';
import { Types } from 'lattice';
import { IconButton, Card, Checkbox } from 'lattice-ui-kit';
import { Logger, ValidationUtils } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import type { UUID } from 'lattice';

import { SpaceBetweenCardSegment } from '../../../components';
import { Routes, RoutingActions } from '../../../core/router';
import { PersonUtils } from '../../../utils';

const { PrincipalTypes } = Types;

const { goToRoute } = RoutingActions;
const { getPrincipalId, getUserId, getUserProfileLabel } = PersonUtils;
const { isValidUUID } = ValidationUtils;

type Props = {
  isOwner :boolean;
  member :Map;
  onChangeRoleCheckBox :(member :Map, isChecked :boolean) => void;
  onClickRemoveMember :(member :Map) => void;
  organizationId :UUID;
  roleId :?UUID;
};

const LOG = new Logger('MemberCard');

const MemberCard = ({
  isOwner,
  member,
  onChangeRoleCheckBox,
  onClickRemoveMember,
  organizationId,
  roleId,
} :Props) => {

  const dispatch = useDispatch();

  const userId :string = getUserId(member);
  const userProfileLabel :string = getUserProfileLabel(member) || userId;
  const securablePrincipalId :?UUID = getPrincipalId(member);

  const isRoleAssignedToMember :boolean = useMemo(() => {
    const roles :List = get(member, 'roles', List());
    const roleIndex :number = roles.findIndex((role :Map) => (
      get(role, 'id') === roleId && getIn(role, ['principal', 'type']) === PrincipalTypes.ROLE
    ));
    return roleIndex !== -1;
  }, [member, roleId]);

  let handleOnClick;
  if (securablePrincipalId && isValidUUID(securablePrincipalId)) {
    handleOnClick = () => {
      dispatch(
        goToRoute(
          Routes.ORG_MEMBER
            .replace(Routes.ORG_ID_PARAM, organizationId)
            .replace(Routes.PRINCIPAL_ID_PARAM, securablePrincipalId),
          { member },
        )
      );
    };
  }
  else {
    LOG.warn('securablePrincipalId is not a valid UUID', securablePrincipalId);
  }

  const handleOnClickRemoveMember = (event :SyntheticEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isOwner) {
      onClickRemoveMember(member);
    }
  };

  const handleOnChangeRoleCheckBox = (event :SyntheticEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (isOwner && roleId) {
      onChangeRoleCheckBox(member, event.currentTarget.checked);
    }
  };

  return (
    <Card onClick={handleOnClick}>
      <SpaceBetweenCardSegment vertical={false}>
        <span title={userProfileLabel}>{userProfileLabel}</span>
        <div>
          {
            roleId && (
              <Checkbox
                  checked={isRoleAssignedToMember}
                  disabled={!isOwner}
                  onChange={handleOnChangeRoleCheckBox} />
            )
          }
          {
            !roleId && (
              <IconButton color="error" disabled={!isOwner} onClick={handleOnClickRemoveMember}>
                <FontAwesomeIcon fixedWidth icon={faTrash} />
              </IconButton>
            )
          }
        </div>
      </SpaceBetweenCardSegment>
    </Card>
  );
};

export default MemberCard;
