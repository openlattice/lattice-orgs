/*
 * @flow
 */

import styled from 'styled-components';
import { CardSegment } from 'lattice-ui-kit';

const SpaceBetweenCardSegment = styled(CardSegment)`
  align-items: center;
  flex-direction: row;
  justify-content: space-between;

  > :first-child {
    overflow: hidden;
    padding-right: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export default SpaceBetweenCardSegment;
