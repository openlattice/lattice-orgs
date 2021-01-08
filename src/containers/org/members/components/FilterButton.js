// @flow
import React, { useState } from 'react';

import styled from 'styled-components';
import { faAngleDown } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Checkbox,
  Menu,
  MenuItem,
  NestedMenuItem,
} from 'lattice-ui-kit';
import type { Role, UUID } from 'lattice';

import { ExternalLinkIcon } from '../../../../assets/svg/icons';
import { Routes } from '../../../../core/router';

const ChevronDown = <FontAwesomeIcon icon={faAngleDown} />;
const LinkIcon = styled(ExternalLinkIcon)`
  margin-right: 8px;
`;

const SlimMenuItem = styled(MenuItem)`
  padding: 0 16px;
`;
const FilterItem = styled.div`
  display: flex;
  flex: 0 1 100%;
  justify-content: space-between;
  align-items: center;
  > :first-child {
    margin-right: 16px;
  }
`;

type Props = {
  onFilterChange :() => void;
  organizationId :UUID;
  roles :Role[];
};

const FilterButton = ({
  onFilterChange,
  organizationId,
  roles,
} :Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const rolesPath = Routes.ORG_ROLES.replace(Routes.ORG_ID_PARAM, organizationId);

  const handleButtonOnClick = (event :SyntheticEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuOnClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <>
      <Button
          endIcon={ChevronDown}
          onClick={handleButtonOnClick}
          variant="text">
        Filter
      </Button>
      <Menu
          anchorEl={menuAnchorEl}
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'bottom',
          }}
          elevation={4}
          getContentAnchorEl={null}
          id="member-overflow-menu"
          onClose={handleMenuOnClose}
          open={!!menuAnchorEl}
          transformOrigin={{
            horizontal: 'right',
            vertical: 'top',
          }}>
        <NestedMenuItem
            elevation={4}
            label="Role"
            parentMenuOpen={!!menuAnchorEl}>
          {
            roles.map((role, index) => {
              const roleId :UUID = role.id || '';
              const key = `filter-${roleId || index}`;
              const lastItem = index === roles.length - 1;
              return (
                <SlimMenuItem divider={lastItem} key={key}>
                  <FilterItem>
                    <span>{role.title}</span>
                    <Checkbox />
                  </FilterItem>
                </SlimMenuItem>
              );
            })
          }
          <MenuItem component="a" href={`#${rolesPath}`}>
            <LinkIcon />
            Manage Roles
          </MenuItem>
        </NestedMenuItem>
        <NestedMenuItem
            elevation={4}
            label="Authorization"
            parentMenuOpen={!!menuAnchorEl}>
          <MenuItem>Social</MenuItem>
          <MenuItem>SAML</MenuItem>
        </NestedMenuItem>
      </Menu>
    </>
  );
};

export default FilterButton;
