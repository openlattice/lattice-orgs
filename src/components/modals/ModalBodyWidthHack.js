import styled from 'styled-components';

const ModalBodyWidthHack = styled.div`
  overflow: hidden;
  width: ${({ width }) => ((typeof width === 'number' && width > 0) ? width : 720)}px;
`;

export default ModalBodyWidthHack;
