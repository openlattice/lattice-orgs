/*
 * @flow
 */

import React from 'react';

import { faUserFriends } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map, get } from 'immutable';
import { Card, CardSegment, Typography } from 'lattice-ui-kit';
import type { UUID } from 'lattice';

import { GapGrid, StackGrid } from '../grids';

const SimpleCollaborationCard = ({
  collaboration,
} :{|
  collaboration :Map;
|}) => {

  const collaborationId :UUID = get(collaboration, 'id');
  const collaborationTitle :string = get(collaboration, 'title');
  const collaborationDescription :string = get(collaboration, 'description');
  const collaborationOrganizations :List = get(collaboration, 'organizationIds', List());
  // TODO: add onclick to go to collaboration details page.

  return (
    <Card id={collaborationId}>
      <CardSegment padding="24px">
        <StackGrid gap={8}>
          <Typography component="h2" variant="h4">{collaborationTitle}</Typography>
          <Typography>{collaborationDescription}</Typography>
          <GapGrid>
            <FontAwesomeIcon fixedWidth icon={faUserFriends} />
            <Typography>{collaborationOrganizations.count()}</Typography>
          </GapGrid>
        </StackGrid>
      </CardSegment>
    </Card>
  );
};

export default SimpleCollaborationCard;
