import styled, { css } from 'styled-components';
import { Colors } from 'lattice-ui-kit';

const { NEUTRAL } = Colors;

const SectionGrid = styled.section`
  display: grid;
  flex: 1;
  grid-auto-rows: min-content;
  ${({ columns }) => {
    if (columns > 0) {
      return css`
        grid-column-gap: 30px;
        grid-template-columns: repeat(${columns}, 1fr);
      `;
    }
    return null;
  }}

  > div {
    position: relative;
    margin-top: 30px;

    /*
     * !!! IMPORTANT !!!
     *
     * https://www.w3.org/TR/css-flexbox-1/
     *   | By default, flex items won’t shrink below their minimum content size (the length of the longest word or
     *   | fixed-size element). To change this, set the min-width or min-height property.
     *
     * https://dfmcphee.com/flex-items-and-min-width-0/
     * https://css-tricks.com/flexbox-truncated-text/
     *
     * !!! IMPORTANT !!!
     */
    min-width: 0; /* setting min-width fixes the text truncation issue */
  }

  > h2 {
    font-size: 22px;
    font-weight: 500;
    margin: 0;
  }

  > h4 {
    color: ${NEUTRAL.N500};
    font-size: 16px;
    font-weight: normal;
    margin: 16px 0 0 0;
  }

  > h5 {
    color: ${NEUTRAL.N500};
    font-size: 14px;
    font-weight: normal;
    margin: 16px 0 0 0;
  }

  i {
    color: ${NEUTRAL.N500};
    font-size: 16px;
    font-weight: normal;
    margin: 32px 0 0 0;
  }

  pre {
    margin: 0;
  }
`;

export default SectionGrid;
