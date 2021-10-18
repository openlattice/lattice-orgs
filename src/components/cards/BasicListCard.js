// @flow

import styled from 'styled-components';
import { Colors } from 'lattice-ui-kit';

const { NEUTRAL } = Colors;

const BasicListCard = styled.div`
  align-items: center;
  background-color: ${NEUTRAL.N50};
  border-radius: 5px;
  color: inherit;
  cursor: pointer;
  display: flex;
  padding: 8px 16px;
  text-decoration: none;
`;

export default BasicListCard;
