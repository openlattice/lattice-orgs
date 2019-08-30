import styled from 'styled-components';

import ActionControlWithButton from './ActionControlWithButton';

const SelectControlWithButton = styled(ActionControlWithButton)`
  > div {
    display: flex;

    > div {
      flex: 1;
    }
  }
`;

export default SelectControlWithButton;
