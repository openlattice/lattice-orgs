/*
 * @flow
 */

import React, {
  Fragment,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ComponentType } from 'react';

import _capitalize from 'lodash/capitalize';
import styled from 'styled-components';
import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map, Set } from 'immutable';
import { Models, Types } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import {
  CardSegment,
  Colors,
  IconButton,
  Typography,
} from 'lattice-ui-kit';
import { DataUtils, ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type {
  Ace,
  FQN,
  PermissionType,
  Principal,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import DataSetColumnPermissionsSection from './DataSetColumnPermissionsSection';
import { ObjectPermissionCheckbox } from './components';
import { ORDERED_PERMISSIONS } from './constants';

import Divider from '../../components/other/Divider';
import { SpaceBetweenGrid, Spinner, StackGrid } from '../../components';
import { FQNS } from '../../core/edm/constants';
import { UPDATE_PERMISSIONS, updatePermissions } from '../../core/permissions/actions';
import { PERMISSIONS } from '../../core/redux/constants';
import { selectMyKeys, selectUser } from '../../core/redux/selectors';
import { getPrincipalTitle } from '../../utils';

const { NEUTRAL } = Colors;
const { AceBuilder } = Models;
const { ActionTypes } = Types;
const { getPropertyValue } = DataUtils;
const { isPending } = ReduxUtils;

const PermissionTypeWrapper :ComponentType<{|
  children :any;
  isDataSet ?:boolean;
|}> = styled.div`
  background-color: ${({ isDataSet }) => (isDataSet ? NEUTRAL.N50 : 'white')};
  border-radius: 5px;
  margin-left: 64px;
  padding: ${({ isDataSet }) => (isDataSet ? '2px 2px 2px 16px' : '0 12px 0 0')};
`;

const ColumnsWrapper = styled.div`
  margin: 8px 12px 8px 96px;
`;

const SpinnerWrapper = styled.div`
  display: flex;
  margin-right: -4px; /* for alignment with checkbox / chevron */
  min-height: 40px; /* because checkbox has this min-height */
`;

const ObjectPermissionsCard = ({
  dataSetColumns,
  isDataSet,
  objectKey,
  permissions,
  principal,
} :{|
  dataSetColumns :List<Map<FQN, List>>;
  isDataSet :boolean;
  objectKey :List<UUID>;
  permissions :Map<List<UUID>, Ace>;
  principal :Principal;
|}) => {

  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [openPermissionType, setOpenPermissionType] = useState('');
  const [targetColumnId, setTargetColumnId] = useState('');

  const updatePermissionsRS :?RequestState = useRequestState([PERMISSIONS, UPDATE_PERMISSIONS]);

  const myKeys :Set<List<UUID>> = useSelector(selectMyKeys());
  const user :Map = useSelector(selectUser(principal.id));
  const thisUserInfo = AuthUtils.getUserInfo() || { id: '' };
  const thisUserId = thisUserInfo.id;
  const title :string = getPrincipalTitle(principal, user, thisUserId);

  useEffect(() => {
    if (!isPending(updatePermissionsRS)) {
      setTargetColumnId('');
    }
  }, [updatePermissionsRS]);

  const objectAce :?Ace = permissions.get(objectKey);

  const objectPermissionsString = useMemo(() => (
    ORDERED_PERMISSIONS
      .filter((permissionType :PermissionType) => objectAce?.permissions.includes(permissionType))
      .map((permissionType :PermissionType) => permissionType.toLowerCase())
      .join(', ')
  ), [objectAce]);

  const handleOnChangePermission = (targetKey :List<UUID>, permissionType :PermissionType, isChecked :boolean) => {
    if (!isPending(updatePermissionsRS)) {
      const aceForUpdate = (new AceBuilder()).setPermissions([permissionType]).setPrincipal(principal).build();
      dispatch(
        updatePermissions([{
          actionType: isChecked ? ActionTypes.ADD : ActionTypes.REMOVE,
          permissions: Map().set(targetKey, aceForUpdate),
        }])
      );
      if (targetKey.has(1)) {
        setTargetColumnId(targetKey.get(1));
      }
    }
  };

  const toggleOpenPermissionType = (permissionType :PermissionType) => {
    if (openPermissionType === permissionType) {
      setOpenPermissionType('');
    }
    else {
      setOpenPermissionType(permissionType);
    }
  };

  return (
    <CardSegment padding="24px 0">
      <StackGrid gap={8}>
        <CardSegment borderless padding="0 2px 0 0">
          <SpaceBetweenGrid>
            <Typography component="span">{title}</Typography>
            <SpaceBetweenGrid gap={8}>
              <Typography component="span">{objectPermissionsString}</Typography>
              <IconButton aria-label="toggle open/close" onClick={() => setIsOpen(!isOpen)}>
                <FontAwesomeIcon fixedWidth icon={isOpen ? faChevronUp : faChevronDown} />
              </IconButton>
            </SpaceBetweenGrid>
          </SpaceBetweenGrid>
        </CardSegment>
        {
          isOpen && (
            ORDERED_PERMISSIONS.map((permissionType :PermissionType) => {
              const isOpenPermissionType = openPermissionType === permissionType;
              return (
                <Fragment key={permissionType}>
                  <PermissionTypeWrapper isDataSet={isDataSet}>
                    <SpaceBetweenGrid>
                      <Typography component="span">{_capitalize(permissionType)}</Typography>
                      {
                        isDataSet && (
                          <IconButton
                              aria-label="toggle open/close permission type"
                              onClick={() => toggleOpenPermissionType(permissionType)}>
                            <FontAwesomeIcon fixedWidth icon={isOpenPermissionType ? faChevronUp : faChevronDown} />
                          </IconButton>
                        )
                      }
                      {
                        !isDataSet && isPending(updatePermissionsRS) && (
                          <SpinnerWrapper>
                            <Spinner size="lg" />
                          </SpinnerWrapper>
                        )
                      }
                      {
                        !isDataSet && !isPending(updatePermissionsRS) && (
                          <ObjectPermissionCheckbox
                              ace={objectAce}
                              isAuthorized={myKeys.has(objectKey)}
                              objectKey={objectKey}
                              onChange={handleOnChangePermission}
                              permissionType={permissionType} />
                        )
                      }
                    </SpaceBetweenGrid>
                  </PermissionTypeWrapper>
                  {
                    isOpenPermissionType && (
                      <ColumnsWrapper key={permissionType}>
                        <StackGrid>
                          <div>
                            <Typography gutterBottom variant="body2">Object</Typography>
                            <SpaceBetweenGrid>
                              <Typography component="span">Data Set Object</Typography>
                              <ObjectPermissionCheckbox
                                  ace={objectAce}
                                  isAuthorized={myKeys.has(objectKey)}
                                  objectKey={objectKey}
                                  onChange={handleOnChangePermission}
                                  permissionType={permissionType} />
                            </SpaceBetweenGrid>
                          </div>
                          <div>
                            <SpaceBetweenGrid>
                              <Typography gutterBottom variant="body2">Columns</Typography>
                            </SpaceBetweenGrid>
                            <DataSetColumnPermissionsSection
                                dataSetColumns={dataSetColumns}
                                objectKey={objectKey}
                                permissions={permissions}
                                permissionType={permissionType}
                                principal={principal} />
                            <Divider />
                            {
                              dataSetColumns.map((column :Map<FQN, List>) => {
                                const columnId :UUID = getPropertyValue(column, [FQNS.OL_ID, 0]);
                                const columnTitle :UUID = getPropertyValue(column, [FQNS.OL_TITLE, 0]);
                                const columnType :string = getPropertyValue(column, [FQNS.OL_TYPE, 0]);
                                const key :List<UUID> = List([objectKey.get(0), columnId]);
                                const ace :?Ace = permissions.get(key);
                                return (
                                  <SpaceBetweenGrid key={columnId}>
                                    <Typography data-column-id={columnId} title={columnType}>
                                      {columnTitle}
                                    </Typography>
                                    {
                                      isPending(updatePermissionsRS) && targetColumnId === columnId
                                        ? (
                                          <SpinnerWrapper>
                                            <Spinner size="lg" />
                                          </SpinnerWrapper>
                                        )
                                        : (
                                          <ObjectPermissionCheckbox
                                              ace={ace}
                                              isAuthorized={myKeys.has(key)}
                                              objectKey={key}
                                              onChange={handleOnChangePermission}
                                              permissionType={permissionType} />
                                        )
                                    }
                                  </SpaceBetweenGrid>
                                );
                              })
                            }
                          </div>
                        </StackGrid>
                      </ColumnsWrapper>
                    )
                  }
                </Fragment>
              );
            })
          )
        }
      </StackGrid>
    </CardSegment>
  );
};

export default ObjectPermissionsCard;
