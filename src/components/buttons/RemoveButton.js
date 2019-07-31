import styled from 'styled-components';
import { Button } from 'lattice-ui-kit';

const BG_1 = '#ffd0cb'; // default
const BG_2 = '#ffbeb7'; // hover
const BG_3 = '#fb9f95'; // active

const COLOR_1 = '#f14e3f'; // default
const COLOR_2 = '#e52c1b'; // hover
const COLOR_3 = '#d61908'; // active

const RemoveButton = styled(Button)`
  background-color: ${BG_1};
  border-color: ${BG_1};
  color: ${COLOR_1};
  transition: background-color 0.1s ease-in-out, border-color 0.1s ease-in-out, color 0.1s ease-in-;

  :hover {
    background-color: ${BG_2};
    border-color: ${BG_2};
    color: ${COLOR_2};
  };

  :active {
    background-color: ${BG_3};
    border-color: ${BG_3};
    color: ${COLOR_3};
  };
`;

export default RemoveButton;
