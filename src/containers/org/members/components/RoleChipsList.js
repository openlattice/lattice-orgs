// @flow
import React, { useRef, useState } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
// $FlowFixMe[missing-export
import { Chip } from 'lattice-ui-kit';
import type { Role, UUID } from 'lattice';

import RoleOverflowPopover from './RoleOverflowPopover';
import usePriorityVisibility from './usePriorityVisibility';

import { Routes } from '../../../../core/router';
import { getUserProfile } from '../../../../utils';

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
  const [overflowAnchorEl, setOverflowAnchorEl] = useState(null);

  const [priority, remainder] = usePriorityVisibility(chipListRef, roles, 4, 52);

  const handleOverflowClick = (event) => {
    setOverflowAnchorEl(event?.currentTarget);
  };

  const handleClose = () => {
    setOverflowAnchorEl(null);
  };

  const { id } = getUserProfile(member);
  const getHandleDelete = (role :Role) => (e :SyntheticEvent<HTMLElement>) => {
    e.preventDefault();
    handleClose();
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
          !!remainder.length && (
            <>
              <Chip
                  clickable
                  label={`+${remainder.length}`}
                  onClick={handleOverflowClick}
                  variant="outline" />
              <RoleOverflowPopover
                  anchorEl={overflowAnchorEl}
                  deletable={deletable}
                  handleDelete={getHandleDelete}
                  onClose={handleClose}
                  open={!!overflowAnchorEl}
                  organizationId={organizationId}
                  roles={remainder} />
            </>
          )
        }
      </ChipsList>
    </>
  );
};

export default RoleChipsList;
