import React from 'react';
import styled from 'styled-components';

import { Card, Spinner } from 'lattice-ui-kit';

const OverlayCard = styled(Card)`
  display: flex;
  height: 100%;
  justify-content: center;
  position: absolute;
  top: 0;
  width: 100%;
`;

const SpinnerOverlayCard = () => (
  <OverlayCard>
    <Spinner size="2x" />
  </OverlayCard>
);

export default SpinnerOverlayCard;
