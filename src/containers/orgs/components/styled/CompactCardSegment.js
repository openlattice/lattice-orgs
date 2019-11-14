import styled from 'styled-components';

import { CardSegment } from 'lattice-ui-kit';

const CompactCardSegment = styled(CardSegment)`
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 3px 3px 3px 10px;

  > span {
    overflow: hidden;
    padding-right: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export default CompactCardSegment;
