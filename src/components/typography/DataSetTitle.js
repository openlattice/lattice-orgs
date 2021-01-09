/*
 * @flow
 */

import React from 'react';

import { Typography } from 'lattice-ui-kit';
import type { Map } from 'immutable';
import type { EntitySet } from 'lattice';

import { AtlasDataSetIcon, EntitySetIcon } from '../../assets/svg/icons';
import { getDataSetField, isAtlasDataSet } from '../../utils';
import { GapGrid } from '../grids';

const DataSetTitle = ({
  component,
  dataSet,
  variant,
} :{
  component ?:string;
  dataSet :EntitySet | Map;
  variant ?:string;
}) => (
  <GapGrid gap={8}>
    {
      isAtlasDataSet(dataSet)
        ? <AtlasDataSetIcon />
        : <EntitySetIcon />
    }
    <Typography component={component} variant={variant}>
      {getDataSetField(dataSet, 'title') || getDataSetField(dataSet, 'name')}
    </Typography>
  </GapGrid>
);

DataSetTitle.defaultProps = {
  component: 'span',
  variant: undefined,
};

export default DataSetTitle;
