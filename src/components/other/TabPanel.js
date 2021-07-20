import styled from 'styled-components';

const TabPanel = styled.div`
  display: ${(props) => (props.show ? 'block' : 'none')};
  padding: 8px 0 0;
`;

export default TabPanel;
