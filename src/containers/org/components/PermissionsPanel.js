/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import _capitalize from 'lodash/capitalize';
import _lowerCase from 'lodash/lowerCase';
import styled from 'styled-components';
import { faTimes } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map, Set } from 'immutable';
import { Models } from 'lattice';
import {
  Button,
  Card,
  CardSegment,
  Checkbox,
  Colors,
  IconButton,
  Sizes,
  StyleUtils,
  Typography,
} from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type {
  Ace,
  PermissionType,
  Principal,
  PropertyType,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { Divider } from '../../../components';
import { SET_PERMISSIONS, setPermissions } from '../../../core/permissions/actions';
import { PERMISSIONS } from '../../../core/redux/constants';
import { selectEntitySetPropertyTypes, selectPermissions } from '../../../core/redux/utils';

const { NEUTRAL } = Colors;
const { APP_CONTENT_PADDING } = Sizes;
const { media } = StyleUtils;
const { AceBuilder } = Models;

const Panel = styled.div`
  background-color: white;
  border-left: 1px solid ${NEUTRAL.N100};
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 384px;
  padding: ${APP_CONTENT_PADDING}px;
  ${media.phone`
    padding: ${APP_CONTENT_PADDING / 2}px;
  `}
`;

const PanelHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const PropertyTypesCard = styled(Card)`
  border: none;
`;

const PropertyTypeCardSegment = styled(CardSegment)`
  align-items: center;
  flex-direction: row;
  gap: 8px;
  justify-content: space-between;
  padding: 8px 0;
`;

const PermissionsPanel = ({
  dataSetId,
  onClose,
  permissionType,
  principal,
} :{|
  dataSetId :UUID;
  onClose :() => void;
  principal :Principal;
  permissionType :PermissionType;
|}) => {

  const dispatch = useDispatch();

  const propertyTypes :Map<UUID, PropertyType> = useSelector(selectEntitySetPropertyTypes(dataSetId));
  const setPermissionsRS :?RequestState = useRequestState([PERMISSIONS, SET_PERMISSIONS]);

  const keys :List<List<UUID>> = useMemo(() => (
    List().withMutations((mutableList) => {
      propertyTypes.keySeq().forEach((propertyTypeId :UUID) => {
        mutableList.push(List([dataSetId, propertyTypeId]));
      });
    })
  ), [dataSetId, propertyTypes.hashCode()]);

  const propertyTypePermissions :Map<List<UUID>, Ace> = useSelector(selectPermissions(keys, principal));

  // NOTE: !!! super important !!!
  // in order for useState() to behave correctly here, PermissionsPanel MUST be passed a unique "key" prop
  const [localPropertyTypePermissions, setLocalPropertyTypePermissions] = useState(propertyTypePermissions);
  const equalPermissions :boolean = propertyTypePermissions.equals(localPropertyTypePermissions);

  const handleOnChangePermission = (event :SyntheticEvent<HTMLInputElement>) => {

    const propertyTypeId :UUID = event.currentTarget.dataset.propertyTypeId;
    const key :List<UUID> = List([dataSetId, propertyTypeId]);

    if (event.currentTarget.checked) {
      const updatedPermissions :Map<List<UUID>, Ace> = localPropertyTypePermissions.update(key, (ace :Ace) => {
        const updatedAcePermissions = Set(ace.permissions).add(permissionType);
        return (new AceBuilder(ace)).setPermissions(updatedAcePermissions).build();
      });
      setLocalPropertyTypePermissions(updatedPermissions);
    }
    else {
      const updatedPermissions :Map<List<UUID>, Ace> = localPropertyTypePermissions.update(key, (ace :Ace) => {
        const updatedAcePermissions = Set(ace.permissions).delete(permissionType);
        return (new AceBuilder(ace)).setPermissions(updatedAcePermissions).build();
      });
      setLocalPropertyTypePermissions(updatedPermissions);
    }

  };

  const handleOnClickSave = () => {
    const updatedPropertyTypePermissions :Map<List<UUID>, Ace> = localPropertyTypePermissions
      .filter((ace :Ace, key :List<UUID>) => (
        // NOTE: valueOf() will be different if the "permissions" order is different
        ace.valueOf() !== propertyTypePermissions.get(key).valueOf()
      ));
    dispatch(setPermissions(updatedPropertyTypePermissions));
  };

  // TODO: setPermissionsRS update ui with SUCCESS/FAILURE states

  return (
    <Panel>
      <PanelHeader>
        <Typography variant="h1">{_capitalize(permissionType)}</Typography>
        <IconButton onClick={onClose}>
          <FontAwesomeIcon color={NEUTRAL.N800} fixedWidth icon={faTimes} size="lg" />
        </IconButton>
      </PanelHeader>
      <Divider isVisible={false} margin={12} />
      <Typography variant="body1">
        {`These are the properties that are assigned the ${_lowerCase(permissionType)} permission.`}
      </Typography>
      <Divider isVisible={false} margin={24} />
      <PropertyTypesCard>
        {
          propertyTypes.valueSeq().map((propertyType :PropertyType) => {
            const propertyTypeId :UUID = (propertyType.id :any);
            const key :List<UUID> = List([dataSetId, propertyTypeId]);
            const ace :?Ace = localPropertyTypePermissions.get(key);
            const isPermissionAssigned = ace?.permissions.includes(permissionType);
            return (
              <PropertyTypeCardSegment key={propertyTypeId}>
                <div>
                  <Typography variant="body1">{propertyType.title}</Typography>
                  <Typography variant="caption">{propertyType.type.toString()}</Typography>
                </div>
                <Checkbox
                    checked={isPermissionAssigned}
                    data-property-type-id={propertyTypeId}
                    onChange={handleOnChangePermission} />
              </PropertyTypeCardSegment>
            );
          })
        }
      </PropertyTypesCard>
      <Divider isVisible={false} margin={24} />
      <Button
          color="primary"
          disabled={equalPermissions}
          isLoading={setPermissionsRS === RequestStates.PENDING}
          onClick={handleOnClickSave}>
        Save
      </Button>
    </Panel>
  );
};

export default PermissionsPanel;
