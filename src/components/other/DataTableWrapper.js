/*
 * @flow
 */

import type { ComponentType } from 'react';

import styled from 'styled-components';
import { Colors } from 'lattice-ui-kit';

const { NEUTRAL } = Colors;

const DataTableWrapper :ComponentType<{|
  children ?:any;
  wrap ?:boolean;
|}> = styled.div`
  overflow: scroll;
  padding: 0;

  > div {
    border: 1px solid ${NEUTRAL.N100};
    border-radius: 3px;
    overflow: scroll;
  }

  table {
    margin-bottom: -1px;
    min-width: 100%;
    overflow: scroll;
    width: auto;
  }

  td,
  th {
    max-width: 500px;
    min-width: 200px;
    overflow: ${({ wrap }) => (wrap ? undefined : 'hidden')};
    text-overflow: ${({ wrap }) => (wrap ? undefined : 'ellipsis')};
    white-space: ${({ wrap }) => (wrap ? undefined : 'nowrap')};
  }

  th {
    padding: 15px 10px;
  }
`;

export default DataTableWrapper;
