import React from 'react';

import { Table, TableBody, TableRow } from 'lattice-ui-kit';

const HEADERS = [
  { key: 'checkbox', label: '', sortable: false },
  { key: 'name', label: 'name' },
  { key: 'auth', label: 'auth' },
  { key: 'roles', label: 'roles' }
];

const PeopleTable = () => {
  return (
    <Table headers={HEADERS} />
  );
};

export default PeopleTable;
