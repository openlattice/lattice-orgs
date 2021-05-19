/*
 * @flow
 */

import type { ComponentType } from 'react';

import styled from 'styled-components';
import { AppContentWrapper } from 'lattice-ui-kit';

const NavContentWrapper :ComponentType<{|
  bgColor ?:string;
  borderless ?:boolean;
  children ?:any;
|}> = styled(AppContentWrapper)`
  > div {
    padding: 0;
  }
`;

export default NavContentWrapper;
