/*
 * @flow
 */

import { Children } from 'react';
import type { ComponentType } from 'react';

import _isInteger from 'lodash/isInteger';
import styled, { css } from 'styled-components';

type Props = {|
  align ?:{|
    h ?:'start' | 'center' | 'end';
    v ?:'start' | 'center' | 'end';
  |};
  children :any;
  fit ?:boolean;
  gap ?:number;
|};

const getComputedStyles = ({
  align,
  children,
  fit,
  gap
} :Props) => {

  const count = Children.count(children) - 1;

  let gtc = `1fr repeat(${count}, auto)`;
  if (fit) {
    gtc = `fit-content(100%) repeat(${count}, min-content)`;
  }

  return css`
    align-items: ${(align && align.v) ? align.v : 'start'};
    grid-gap: ${_isInteger(gap) ? gap : 8}px;
    grid-template-columns: ${gtc};
    justify-content: ${(align && align.h) ? align.h : 'start'};
  `;
};

const ActionsGrid :ComponentType<Props> = styled.div`
  display: grid;
  flex: 1;
  grid-auto-flow: column;
  ${getComputedStyles}

  button {
    line-height: 1.5;
  }
`;

export default ActionsGrid;
