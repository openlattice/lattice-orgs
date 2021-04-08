/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';

const FlipWrapper = styled.div`
  > button {
    transform: ${({ flip }) => (flip ? 'rotate(180deg)' : 'rotate(0deg)')};
    transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const Flip = ({
  children,
  flip,
} :{
  children :any;
  flip :boolean;
}) => (
  <FlipWrapper flip={flip}>
    {children}
  </FlipWrapper>
);

export default Flip;
