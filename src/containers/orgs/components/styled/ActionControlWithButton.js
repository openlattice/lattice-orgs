import styled from 'styled-components';

const ActionControlWithButton = styled.div`
  display: grid;
  grid-gap: 5px;
  grid-template-columns: 1fr auto;

  > button {
    margin-right: 4px;
  }
`;

export default ActionControlWithButton;
