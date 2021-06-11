/*
 * @flow
 */

import React from 'react';

import { Typography } from 'lattice-ui-kit';
import type { Map } from 'immutable';

import { AtlasDataSetIcon, EntitySetIcon } from '../../assets/svg/icons';
import { isAtlasDataSet } from '../../utils';
import { GapGrid } from '../grids';

const DataSetTitle = ({
  component,
  dataSet,
  variant,
} :{
  component ?:string;
  dataSet :Map;
  variant ?:string;
}) => (
  <GapGrid gap={8}>
    {
      isAtlasDataSet(dataSet)
        ? <AtlasDataSetIcon />
        : <EntitySetIcon />
    }
    <Typography component={component} variant={variant}>
      {
        dataSet.getIn(['metadata', 'title']) || dataSet.get('name')
      }
    </Typography>
  </GapGrid>
);

DataSetTitle.defaultProps = {
  component: 'span',
  variant: undefined,
};

export default DataSetTitle;
