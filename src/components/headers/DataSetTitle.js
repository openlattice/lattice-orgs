/*
 * @flow
 */

import React from 'react';

import _isInteger from 'lodash/isInteger';
import styled from 'styled-components';
import { faServer } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Typography } from 'lattice-ui-kit';

import { EntitySetIcon } from '../../assets/svg/icons';

const Title = styled(Typography)`
  align-items: center;
  display: grid;
  grid-gap: ${({ iconGap }) => (_isInteger(iconGap) ? iconGap : 8)}px;
  grid-template-columns: auto 1fr;
`;

const DataSetTitle = ({
  children,
  component,
  iconGap,
  isAtlasDataSet,
  variant,
} :{
  children :any;
  component ?:string;
  iconGap ?:number;
  isAtlasDataSet :boolean;
  variant ?:string;
}) => (
  <Title component={component} iconGap={iconGap} variant={variant}>
    {
      isAtlasDataSet
        ? <FontAwesomeIcon fixedWidth icon={faServer} />
        : <EntitySetIcon />
    }
    <span>{children}</span>
  </Title>
);

DataSetTitle.defaultProps = {
  component: 'span',
  iconGap: undefined,
  variant: undefined,
};

export default DataSetTitle;
