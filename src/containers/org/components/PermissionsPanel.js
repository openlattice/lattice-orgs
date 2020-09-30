/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import _capitalize from 'lodash/capitalize';
import _lowerCase from 'lodash/lowerCase';
import styled from 'styled-components';
import { faTimes } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  List,
  Map,
  Set,
  get,
} from 'immutable';
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
import { selectDataSetProperties, selectPermissions } from '../../../core/redux/selectors';

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

  const setPermissionsRS :?RequestState = useRequestState([PERMISSIONS, SET_PERMISSIONS]);

  const properties :Map<UUID, PropertyType | Map> = useSelector(selectDataSetProperties(dataSetId));

  const keys :List<List<UUID>> = useMemo(() => (
    List().withMutations((mutableList) => {
      properties.keySeq().forEach((id :UUID) => {
        mutableList.push(List([dataSetId, id]));
      });
    })
  ), [dataSetId, properties.hashCode()]);

  const permissions :Map<List<UUID>, Ace> = useSelector(selectPermissions(keys, principal));

  // NOTE: !!! super important !!!
  // in order for useState() to behave correctly here, PermissionsPanel MUST be passed a unique "key" prop
  const [localPermissions, setLocalPermissions] = useState(permissions);

  // TODO: update Ace model to use Set for immutable equality to be able to use .equals()
  // const equalPermissions :boolean = permissions.equals(localPermissions);
  const equalPermissions :boolean = permissions.reduce((isEqual :boolean, ogAce :Ace, key :List<UUID>) => {
    const localAce :Ace = localPermissions.get(key);
    return (
      isEqual
      && localAce.principal.valueOf() === ogAce.principal.valueOf()
      && Set(localAce.permissions).equals(Set(ogAce.permissions))
    );
  }, true);

  const handleOnChangePermission = (event :SyntheticEvent<HTMLInputElement>) => {

    const propertyId :UUID = event.currentTarget.dataset.propertyId;
    const key :List<UUID> = List([dataSetId, propertyId]);

    if (event.currentTarget.checked) {
      const updatedPermissions :Map<List<UUID>, Ace> = localPermissions.update(key, (ace :Ace) => {
        const updatedAcePermissions = Set(ace.permissions).add(permissionType);
        return (new AceBuilder(ace)).setPermissions(updatedAcePermissions).build();
      });
      setLocalPermissions(updatedPermissions);
    }
    else {
      const updatedPermissions :Map<List<UUID>, Ace> = localPermissions.update(key, (ace :Ace) => {
        const updatedAcePermissions = Set(ace.permissions).delete(permissionType);
        return (new AceBuilder(ace)).setPermissions(updatedAcePermissions).build();
      });
      setLocalPermissions(updatedPermissions);
    }

  };

  const handleOnClickSave = () => {
    const updatedPropertyTypePermissions :Map<List<UUID>, Ace> = localPermissions
      .filter((ace :Ace, key :List<UUID>) => {
        const ogAce :Ace = permissions.get(key);
        const equal = (
          ace.principal.valueOf() === ogAce.principal.valueOf()
          && Set(ace.permissions).equals(Set(ogAce.permissions))
        );
        return !equal;
      });
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
          properties.valueSeq().map((property :PropertyType | Map) => {
            const propertyId :UUID = property.id || get(property, 'id');
            const propertyTitle :UUID = property.title || get(property, 'title');
            const propertyTypeFQN :?string = property?.type?.toString() || '';
            const key :List<UUID> = List([dataSetId, propertyId]);
            const ace :?Ace = localPermissions.get(key);
            const isPermissionAssigned = ace?.permissions.includes(permissionType);
            return (
              <PropertyTypeCardSegment key={propertyId}>
                <div>
                  <Typography variant="body1">{propertyTitle}</Typography>
                  {
                    propertyTypeFQN && (
                      <Typography variant="caption">{propertyTypeFQN}</Typography>
                    )
                  }
                </div>
                <Checkbox
                    checked={isPermissionAssigned}
                    data-property-id={propertyId}
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
