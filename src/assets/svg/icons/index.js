/*
 * @flow
 */

import styled from 'styled-components';

import EntitySetIconSVG from './entity-set-icon.svg';
import ExternalLinkSVG from './external-link.svg';
import OpenLatticeIconSVG from './ol-icon.svg';
import RoleIconSVG from './role-icon.svg';

const EntitySetIcon = styled.img.attrs({
  alt: 'entity-set-icon',
  src: EntitySetIconSVG,
})``;

const ExternalLinkIcon = styled.img.attrs({
  alt: 'external-link-icon',
  src: ExternalLinkSVG,
})``;

const OpenLatticeIcon = styled.img.attrs({
  alt: 'openlattice-icon',
  src: OpenLatticeIconSVG,
})``;

const RoleIcon = styled.img.attrs({
  alt: 'role-icon',
  src: RoleIconSVG,
})``;

export {
  EntitySetIcon,
  EntitySetIconSVG,
  ExternalLinkIcon,
  ExternalLinkSVG,
  OpenLatticeIcon,
  OpenLatticeIconSVG,
  RoleIcon,
  RoleIconSVG,
};
