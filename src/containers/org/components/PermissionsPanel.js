/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import _capitalize from 'lodash/capitalize';
import _lowerCase from 'lodash/lowerCase';
import styled from 'styled-components';
import { faTimes, faUndo } from '@fortawesome/pro-light-svg-icons';
import { faToggleOn } from '@fortawesome/pro-regular-svg-icons';
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

const { NEUTRAL, PURPLE } = Colors;
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

const PermissionCard = styled(Card)`
  border: none;
`;

const PermissionCardSegment = styled(CardSegment)`
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  padding: 8px 0;
`;

const ButtonsWrapper = styled.div`
  display: grid;
  grid-gap: 8px;
  grid-template-columns: 1fr auto;
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
  const [isPermissionAssignedToAll, setIsPermissionAssignedToAll] = useState(false);
  const [localPermissions, setLocalPermissions] = useState(Map());

  const setPermissionsRS :?RequestState = useRequestState([PERMISSIONS, SET_PERMISSIONS]);

  const properties :Map<UUID, PropertyType | Map> = useSelector(selectDataSetProperties(dataSetId));
  const propertiesHash = properties.hashCode();

  const keys :List<List<UUID>> = useMemo(() => (
    List().withMutations((mutableList) => {
      properties.keySeq().forEach((id :UUID) => {
        mutableList.push(List([dataSetId, id]));
      });
    })
  ), [dataSetId, propertiesHash]);

  const permissions :Map<List<UUID>, Ace> = useSelector(selectPermissions(keys, principal));
  const permissionsHash = permissions.hashCode();

  useEffect(() => {
    setLocalPermissions(permissions);
  }, [permissionsHash]);

  useEffect(() => {
    const result = properties.reduce((assigned :boolean, property :PropertyType | Map) => {
      const propertyId :UUID = property.id || get(property, 'id');
      const key :List<UUID> = List([dataSetId, propertyId]);
      const ace :?Ace = localPermissions.get(key);
      const isPermissionAssigned = ace ? ace.permissions.includes(permissionType) : false;
      return assigned && isPermissionAssigned;
    }, true);
    setIsPermissionAssignedToAll(result);
  }, [dataSetId, localPermissions, permissionType, propertiesHash]);

  // TODO: update Ace model to use Set for immutable equality to be able to use .equals()
  // const equalPermissions :boolean = permissions.equals(localPermissions);
  const arePermissionsEqual = localPermissions.reduce((equal :boolean, localAce :Ace, key :List<UUID>) => {
    const originalAce :?Ace = permissions.get(key);
    if (!originalAce) {
      // NOTE: it's possible the property does not have permissions originally, which means an ace will not exist. in
      // this case, a non-existent ace is equivalent to a local ace with an empty permissions array.
      return equal && localAce.permissions.length === 0;
    }
    return (
      equal
      && localAce.principal.valueOf() === originalAce.principal.valueOf()
      && Set(localAce.permissions).equals(Set(originalAce.permissions))
    );
  }, true);

  const handleOnChangePermission = (event :SyntheticEvent<HTMLInputElement>) => {

    const propertyId :UUID = event.currentTarget.dataset.propertyId;
    const key :List<UUID> = List([dataSetId, propertyId]);

    if (event.currentTarget.checked) {
      const updatedPermissions :Map<List<UUID>, Ace> = localPermissions.update(key, (ace :Ace) => {
        const updatedAcePermissions = Set(ace?.permissions).add(permissionType);
        return (new AceBuilder()).setPermissions(updatedAcePermissions).setPrincipal(principal).build();
      });
      setLocalPermissions(updatedPermissions);
    }
    else {
      const updatedPermissions :Map<List<UUID>, Ace> = localPermissions.update(key, (ace :Ace) => {
        const updatedAcePermissions = Set(ace?.permissions).delete(permissionType);
        return (new AceBuilder()).setPermissions(updatedAcePermissions).setPrincipal(principal).build();
      });
      setLocalPermissions(updatedPermissions);
    }
  };

  const handleOnClickSave = () => {
    const updatedPropertyTypePermissions :Map<List<UUID>, Ace> = localPermissions
      .filter((localAce :Ace, key :List<UUID>) => {
        let equal = true;
        const originalAce :?Ace = permissions.get(key);
        if (!originalAce) {
          // NOTE: it's possible the property does not have permissions originally, which means an ace will not exist.
          // in this case, a non-existent ace is equivalent to a local ace with an empty permissions array.
          equal = localAce.permissions.length === 0;
        }
        else {
          equal = (
            localAce.principal.valueOf() === originalAce.principal.valueOf()
            && Set(localAce.permissions).equals(Set(originalAce.permissions))
          );
        }
        // NOTE: we only want to consider permissions that have changed, i.e. not equal
        return !equal;
      });
    dispatch(setPermissions(updatedPropertyTypePermissions));
  };

  const handleOnClickReset = () => {
    setLocalPermissions(permissions);
  };

  const togglePermissions = () => {
    if (isPermissionAssignedToAll) {
      // remove permission from all properties
      const updatedPermissions :Map<List<UUID>, Ace> = Map().withMutations((mutableMap) => {
        properties.keySeq().forEach((id :UUID) => {
          const key = List([dataSetId, id]);
          const localAce :?Ace = localPermissions.get(key);
          const updatedAcePermissions = Set(localAce?.permissions).delete(permissionType);
          const updatedAce = (new AceBuilder())
            .setPermissions(updatedAcePermissions)
            .setPrincipal(principal)
            .build();
          mutableMap.set(key, updatedAce);
        });
      });
      setLocalPermissions(updatedPermissions);
    }
    else {
      // add permission to all properties
      const updatedPermissions :Map<List<UUID>, Ace> = Map().withMutations((mutableMap) => {
        properties.keySeq().forEach((id :UUID) => {
          const key = List([dataSetId, id]);
          const localAce :?Ace = localPermissions.get(key);
          const updatedAcePermissions = Set(localAce?.permissions).add(permissionType);
          const updatedAce = (new AceBuilder())
            .setPermissions(updatedAcePermissions)
            .setPrincipal(principal)
            .build();
          mutableMap.set(key, updatedAce);
        });
      });
      setLocalPermissions(updatedPermissions);
    }
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
      <PermissionCard>
        <PermissionCardSegment>
          <Typography variant="body1">All Properties</Typography>
          <IconButton onClick={togglePermissions}>
            <FontAwesomeIcon
                color={isPermissionAssignedToAll ? PURPLE.P300 : NEUTRAL.N500}
                fixedWidth
                icon={faToggleOn}
                transform={{ rotate: isPermissionAssignedToAll ? 0 : 180 }}
                size="lg" />
          </IconButton>
        </PermissionCardSegment>
        {
          properties.valueSeq().map((property :PropertyType | Map) => {
            const propertyId :UUID = property.id || get(property, 'id');
            const propertyTitle :UUID = property.title || get(property, 'title');
            const propertyTypeFQN :?string = property?.type?.toString() || '';
            const key :List<UUID> = List([dataSetId, propertyId]);
            const ace :?Ace = localPermissions.get(key);
            const isPermissionAssigned = ace ? ace.permissions.includes(permissionType) : false;
            return (
              <PermissionCardSegment key={propertyId}>
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
              </PermissionCardSegment>
            );
          })
        }
      </PermissionCard>
      <Divider isVisible={false} margin={24} />
      <ButtonsWrapper>
        <Button
            color="primary"
            disabled={arePermissionsEqual}
            isLoading={setPermissionsRS === RequestStates.PENDING}
            onClick={handleOnClickSave}>
          Save
        </Button>
        <IconButton onClick={handleOnClickReset}>
          <FontAwesomeIcon color={NEUTRAL.N800} fixedWidth icon={faUndo} size="lg" />
        </IconButton>
      </ButtonsWrapper>
    </Panel>
  );
};

export default PermissionsPanel;
