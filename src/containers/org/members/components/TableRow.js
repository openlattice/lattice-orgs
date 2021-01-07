// @flow

import React from 'react';

import styled from 'styled-components';
import {
  Map,
  Set,
  get
} from 'immutable';
import {
  Checkbox,
  Colors,
  Typography
} from 'lattice-ui-kit';
import type { Role, UUID } from 'lattice';

import RoleChipsList from './RoleChipsList';

import { getUserProfile } from '../../../../utils/PersonUtils';

const { NEUTRAL } = Colors;

const Row = styled.tr`
  height: 56px;
`;

const Cell = styled.td`
  border: 1px solid ${NEUTRAL.N100};
  max-width: 0px;
  overflow: hidden;
  padding: ${(props) => (props.padding === 'small' ? '0 8px' : '0 16px')};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type Props = {
  isOwner :boolean;
  member :Map;
  onUnassign :(member :Map, role :Role) => void;
  organizationId :UUID;
  roles :Role[];
};

const TableRow = ({
  isOwner,
  member,
  onUnassign,
  organizationId,
  roles,
} :Props) => {
  const { name } = getUserProfile(member);
  const memberRoles = get(member, 'roles');
  const memberRolesIds = Set(memberRoles.map((role) => get(role, 'id')));
  const orgRolesIds = Set(roles.map((role) => role.id));

  const relevantRolesIds = orgRolesIds.intersect(memberRolesIds);
  const relevantRoles = roles.filter((role) => relevantRolesIds.includes(role.id));

  return (
    <Row>
      <Cell>
        <Checkbox />
      </Cell>
      <Cell as="th">
        <Typography align="left" noWrap>{name}</Typography>
      </Cell>
      <Cell>
        <Typography noWrap>Auth0</Typography>
      </Cell>
      <Cell padding="small">
        <RoleChipsList
            deletable={isOwner}
            member={member}
            onUnassign={onUnassign}
            organizationId={organizationId}
            roles={relevantRoles} />
      </Cell>
    </Row>
  );
};

export default TableRow;
