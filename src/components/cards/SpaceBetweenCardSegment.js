/*
 * @flow
 */

import styled from 'styled-components';
import { CardSegment } from 'lattice-ui-kit';

const SpaceBetweenCardSegment = styled(CardSegment)`
  align-items: center;
  justify-content: space-between;
  padding: ${({ padding }) => (padding || '8px 16px')};

  > :first-child {
    overflow: hidden;
    padding-right: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export default SpaceBetweenCardSegment;
