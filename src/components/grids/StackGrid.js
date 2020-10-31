/*
 * @flow
 */

import _isInteger from 'lodash/isInteger';
import styled from 'styled-components';

const StackGrid = styled.div`
  display: grid;
  grid-auto-rows: min-content;
  grid-gap: ${({ gap }) => (_isInteger(gap) ? gap : 16)}px;
  grid-template-columns: 1fr;
  position: relative;
`;

export default StackGrid;
