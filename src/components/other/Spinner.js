/*
 * @flow
 */

import type { ComponentType } from 'react';

import styled from 'styled-components';
import { Spinner as LUKSpinner } from 'lattice-ui-kit';

const Spinner :ComponentType<{|
  size ?:string;
|}> = styled(LUKSpinner).attrs(({ size }) => ({ size: size || '2x' }))`
  justify-self: center;
`;

export default Spinner;
