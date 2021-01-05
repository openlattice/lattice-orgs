// @flow
import React from 'react';

import styled from 'styled-components';
import { faAngleDown, faPlus } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List } from 'immutable';
import {
  Button,
  Checkbox,
  Colors,
  PaginationToolbar,
  SearchInput,
} from 'lattice-ui-kit';

import TableRow from './components/TableRow';

const { NEUTRAL } = Colors;

const TableToolbar = styled.div`
  align-items: center;
  display: grid;
  grid-gap: 8px;
  grid-template-columns: minmax(160px, max-content) 160px 1fr 100px 160px;
  margin: 16px 0;
`;

const MembersCheckboxWrapper = styled.div`
  margin: 0 8px 0 17px;
`;

const Table = styled.table`
  border: 1px solid ${NEUTRAL.N100};
  border-collapse: collapse;
  width: 100%;
`;

const Selection = styled.span`
  margin-left: 10px;
  vertical-align: middle;
`;

const PlusIcon = <FontAwesomeIcon icon={faPlus} size="lg" />;

const ChevronDown = <FontAwesomeIcon icon={faAngleDown} />;

type Props = {
  isOwner :boolean;
  members :List;
};

const PeopleTable = ({
  members,
} :Props) => {
  console.log('something');
  return (
    <div>
      <TableToolbar>
        <MembersCheckboxWrapper>
          <Checkbox />
          <Selection>15 members</Selection>
        </MembersCheckboxWrapper>
        <Button endIcon={ChevronDown} variant="text">Bulk Actions</Button>
        <SearchInput />
        <Button endIcon={ChevronDown} variant="text">Filter</Button>
        <Button color="primary" startIcon={PlusIcon}>Add Member</Button>
      </TableToolbar>
      <Table cellPadding="0" cellSpacing="0">
        <colgroup>
          <col width="56px" />
          <col width="268px" />
          <col width="150px" />
        </colgroup>
        <tbody>
          {
            members.map((member) => {
              const id = member.get('id');
              return <TableRow key={id} member={member} />;
            })
          }
        </tbody>
      </Table>
      <PaginationToolbar />
    </div>

  );
};

PeopleTable.defaultProps = {
  members: List()
};

export default PeopleTable;
