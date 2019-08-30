import styled, { css } from 'styled-components';

const OrgDetailSectionGridItem = styled.div`
  position: relative;
  ${({ marginTop }) => {
    const finalMarginTop = (marginTop >= 0) ? marginTop : 32;
    return css`
      margin: ${finalMarginTop}px 0 0 0;
    `;
  }}
`;

export default OrgDetailSectionGridItem;
