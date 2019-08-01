import styled from 'styled-components';
import { Button } from 'lattice-ui-kit';

const BG_1 = '#d3f0e6'; // default
const BG_2 = '#ace5d1'; // hover
const BG_3 = '#7cd6b6'; // active

const COLOR_1 = '#0aaf77'; // default
const COLOR_2 = '#089c6a'; // hover
const COLOR_3 = '#047750'; // active

const AddButton = styled(Button)`
  background-color: ${BG_1};
  border-color: ${BG_1};
  color: ${COLOR_1};
  transition: background-color 0.1s ease-in-out, border-color 0.1s ease-in-out, color 0.1s ease-in-;

  :hover {
    background-color: ${BG_2};
    border-color: ${BG_2};
    color: ${COLOR_2};
  }

  :active {
    background-color: ${BG_3};
    border-color: ${BG_3};
    color: ${COLOR_3};
  }
`;

export default AddButton;
