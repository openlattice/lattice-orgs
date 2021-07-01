/*
 * @flow
 */

import React from 'react';

import { Typography } from 'lattice-ui-kit';
import type { Map } from 'immutable';

import { AtlasDataSetIcon, EntitySetIcon } from '../../assets/svg/icons';
import { isAtlasDataSet } from '../../utils';
import { METADATA, NAME, TITLE } from '../../utils/constants';
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
        dataSet.getIn([METADATA, TITLE]) || dataSet.get(NAME)
      }
    </Typography>
  </GapGrid>
);

DataSetTitle.defaultProps = {
  component: 'span',
  variant: undefined,
};

export default DataSetTitle;
