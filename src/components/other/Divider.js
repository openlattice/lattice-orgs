/*
 * @flow
 */

import styled, { css } from 'styled-components';
import { Colors } from 'lattice-ui-kit';

const { NEUTRAL } = Colors;

type Props = {
  margin :number;
};

const getComputedStyles = ({ margin } :Props) => {

  let finalMargin = '16px 0';
  if (typeof margin === 'number' && margin >= 0) {
    finalMargin = `${margin}px 0`;
  }

  return css`
    margin: ${finalMargin};
  `;
};

const Divider = styled.hr`
  border-color: ${NEUTRAL.N100};
  border-style: solid none none none;
  border-width: 1px;
  ${getComputedStyles}
`;

export default Divider;
