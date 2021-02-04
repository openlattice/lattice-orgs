/*
 * @flow
 */

import React from 'react';

import { Typography } from 'lattice-ui-kit';
import { DataUtils } from 'lattice-utils';
import type { Map } from 'immutable';

import { AtlasDataSetIcon, EntitySetIcon } from '../../assets/svg/icons';
import { FQNS } from '../../core/edm/constants';
import { getDataSetField, isAtlasDataSet } from '../../utils';
import { GapGrid } from '../grids';

const { getPropertyValue } = DataUtils;

// TODO: this will have to change because we'll no longer be using the data set objects directly
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
        getDataSetField(dataSet, 'title')
        || getDataSetField(dataSet, 'name')
        || getPropertyValue(dataSet, [FQNS.OL_TITLE, 0])
        || getPropertyValue(dataSet, [FQNS.OL_DATA_SET_NAME, 0])
      }
    </Typography>
  </GapGrid>
);

DataSetTitle.defaultProps = {
  component: 'span',
  variant: undefined,
};

export default DataSetTitle;
