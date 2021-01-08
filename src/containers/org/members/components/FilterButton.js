// @flow
import React, { useState } from 'react';

import styled from 'styled-components';
import { faAngleDown } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map, getIn } from 'immutable';
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
  filter :Map;
  onFilterChange :(category :string, value :string) => void;
  organizationId :UUID;
  roles :Role[];
};

const FilterButton = ({
  filter,
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

  const handleOnFilterChange = (event :SyntheticEvent<HTMLLIElement>) => {
    const { category, value } = event.currentTarget.dataset;
    onFilterChange(category, value);
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
              const checked = getIn(filter, ['role', roleId], false);
              return (
                <SlimMenuItem
                    data-category="role"
                    data-value={roleId}
                    divider={lastItem}
                    key={key}
                    onClick={handleOnFilterChange}>
                  <FilterItem>
                    <span>{role.title}</span>
                    <Checkbox
                        checked={checked}
                        readOnly />
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
          <SlimMenuItem
              data-category="authorization"
              data-value="saml"
              onClick={handleOnFilterChange}>
            <FilterItem>
              <span>SAML</span>
              <Checkbox
                  checked={getIn(filter, ['authorization', 'saml'], false)}
                  readOnly />
            </FilterItem>
          </SlimMenuItem>
          <SlimMenuItem
              data-category="authorization"
              data-value="social"
              onClick={handleOnFilterChange}>
            <FilterItem>
              <span>Social</span>
              <Checkbox
                  checked={getIn(filter, ['authorization', 'social'], false)}
                  readOnly />
            </FilterItem>
          </SlimMenuItem>
        </NestedMenuItem>
      </Menu>
    </>
  );
};

FilterButton.defaultProps = {
  filter: Map()
};

export default FilterButton;
