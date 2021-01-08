// @flow
import React, { useRef } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Chip } from 'lattice-ui-kit';
import type { Role, UUID } from 'lattice';

import useVisibileGreed from './usePriorityVisibility';

import { Routes } from '../../../../core/router';
import { getUserProfile } from '../../../../utils/PersonUtils';

const ChipsList = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  > :not(:first-child) {
    margin-left: 4px;
  }
`;

type Props = {
  deletable :boolean;
  member :Map;
  onUnassign :(member :Map, role :Role) => void;
  organizationId :UUID;
  roles :Role[];
};

const RoleChipsList = ({
  deletable,
  member,
  onUnassign,
  organizationId,
  roles,
} :Props) => {
  const chipListRef = useRef(null);

  const [priority, remainder] = useVisibileGreed(chipListRef, roles, 4, 52);

  const { id } = getUserProfile(member);
  const getHandleDelete = (role :Role) => (e :SyntheticEvent<HTMLElement>) => {
    e.preventDefault();
    onUnassign(member, role);
  };

  return (
    <>
      <ChipsList ref={chipListRef}>
        {
          priority.map((role, index) => {
            const roleId :UUID = role.id || '';
            const key = `${id}-${roleId || index}`;
            const rolePath = `#${Routes.ORG_ROLE}`
              .replace(Routes.ORG_ID_PARAM, organizationId)
              .replace(Routes.ROLE_ID_PARAM, roleId);

            return (
              <Chip
                  clickable
                  component="a"
                  href={rolePath}
                  key={key}
                  label={role.title}
                  onDelete={deletable && getHandleDelete(role)} />
            );
          })
        }
        {
          !!remainder.length && <Chip clickable variant="outline" label={`+${remainder.length}`} />
        }
      </ChipsList>
    </>
  );
};

export default RoleChipsList;
