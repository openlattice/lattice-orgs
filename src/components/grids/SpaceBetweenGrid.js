/*
 * @flow
 */

import type { ComponentType } from 'react';

import _isInteger from 'lodash/isInteger';
import styled from 'styled-components';

const SpaceBetweenGrid :ComponentType<{|
  children :any;
  gap ?:number;
|}> = styled.div`
  align-items: center;
  display: grid;
  grid-gap: ${({ gap }) => (_isInteger(gap) ? gap : 16)}px;
  grid-template-columns: 1fr auto;
`;

export default SpaceBetweenGrid;
