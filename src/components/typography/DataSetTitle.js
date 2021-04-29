/*
 * @flow
 */

import React from 'react';

import { Typography } from 'lattice-ui-kit';
import { DataUtils } from 'lattice-utils';
import type { Map } from 'immutable';

import { AtlasDataSetIcon, EntitySetIcon } from '../../assets/svg/icons';
import { FQNS } from '../../core/edm/constants';
import { isAtlasDataSet } from '../../utils';
import { GapGrid } from '../grids';

const { getPropertyValue } = DataUtils;

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
        getPropertyValue(dataSet, [FQNS.OL_TITLE, 0])
        || getPropertyValue(dataSet, [FQNS.OL_DATA_SET_NAME, 0])
        || dataSet.get('title')
        || dataSet.get('name')
      }
    </Typography>
  </GapGrid>
);

DataSetTitle.defaultProps = {
  component: 'span',
  variant: undefined,
};

export default DataSetTitle;
