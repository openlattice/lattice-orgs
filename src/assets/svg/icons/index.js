/*
 * @flow
 */

import styled from 'styled-components';

import EntitySetIconSVG from './entity-set-icon.svg';
import OpenLatticeIconSVG from './ol-icon.svg';

const EntitySetIcon = styled.img.attrs({
  alt: 'entity-set-icon',
  src: EntitySetIconSVG,
})``;

const OpenLatticeIcon = styled.img.attrs({
  alt: 'openlattice-icon',
  src: OpenLatticeIconSVG,
})``;

export {
  EntitySetIcon,
  EntitySetIconSVG,
  OpenLatticeIcon,
  OpenLatticeIconSVG,
};
