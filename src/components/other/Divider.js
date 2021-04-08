/*
 * @flow
 */

import type { ComponentType } from 'react';

import styled, { css } from 'styled-components';
import { Colors } from 'lattice-ui-kit';

const { NEUTRAL } = Colors;

type Props = {
  isVisible ?:boolean;
  margin ?:number;
};

const getComputedStyles = ({ isVisible = true, margin } :Props) => {

  let finalBorderStyle = 'solid none none none';
  if (!isVisible) {
    finalBorderStyle = 'none';
  }

  let finalMargin = '16px 0';
  if (typeof margin === 'number' && margin >= 0) {
    finalMargin = `${margin}px 0`;
  }

  return css`
    border-style: ${finalBorderStyle};
    margin: ${finalMargin};
  `;
};

const Divider :ComponentType<Props> = styled.hr`
  border-color: ${NEUTRAL.N100};
  border-width: 1px;
  ${getComputedStyles}
`;

export default Divider;
