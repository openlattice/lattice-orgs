/*
 * @flow
 */

import { Children } from 'react';
import type { ComponentType } from 'react';

import _isInteger from 'lodash/isInteger';
import styled from 'styled-components';

const ActionsGrid :ComponentType<{
  children :any;
  gap ?:number;
}> = styled.div`
  align-items: flex-start;
  display: grid;
  flex: 1;
  grid-auto-flow: column;
  grid-gap: ${({ gap }) => (_isInteger(gap) ? gap : 8)}px;
  grid-template-columns: 1fr repeat(${({ children }) => Children.count(children) - 1}, auto);

  button {
    line-height: 1.5;
  }
`;

export default ActionsGrid;
