/*
 * @flow
 */

import React, { useEffect, useReducer, useRef } from 'react';

import { faEllipsisV } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import { Types } from 'lattice';
import { DataSetsApiActions } from 'lattice-sagas';
// $FlowFixMe
import { IconButton, Menu, MenuItem } from 'lattice-ui-kit';
import { DataUtils, useGoToRoute } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { FQN, UUID } from 'lattice';

import AssembleMenuItem from './AssembleMenuItem';
import PromoteTableModal from './PromoteTableModal';

import { FQNS } from '../../../../core/edm/constants';
import {
  selectCurrentAuthorization,
  selectDataSetSchema,
  selectMyKeys,
  selectOrgDataSet,
} from '../../../../core/redux/selectors';
import { Routes } from '../../../../core/router';
import { isAtlasDataSet } from '../../../../utils';
import { OPENLATTICE } from '../../../../utils/constants';

const { getOrganizationDataSetSchema } = DataSetsApiActions;
const { EntitySetFlagTypes, PermissionTypes } = Types;
const { getPropertyValue } = DataUtils;

const CLOSE_PROMOTE_DIALOG = 'CLOSE_PROMOTE_DIALOG';
const CLOSE_MENU = 'CLOSE_MENU';
const OPEN_PROMOTE_DIALOG = 'OPEN_PROMOTE_DIALOG';
const OPEN_MENU = 'OPEN_MENU';

const INITIAL_STATE = {
  assembleOpen: false,
  disassembleOpen: false,
  menuOpen: false,
  promoteOpen: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case CLOSE_MENU:
      return {
        ...state,
        menuOpen: false,
      };
    case OPEN_MENU:
      return {
        ...state,
        menuOpen: true,
      };
    case CLOSE_PROMOTE_DIALOG:
      return {
        ...state,
        promoteOpen: false,
      };
    case OPEN_PROMOTE_DIALOG:
      return {
        ...state,
        menuOpen: false,
        promoteOpen: true,
      };
    default:
      return state;
  }
};

const DataSetActionButton = ({
  dataSetId,
  organizationId,
} :{|
  dataSetId :UUID;
  organizationId :UUID;
|}) => {

  const dataSetKey :List<UUID> = List([dataSetId]);

  const dispatch = useDispatch();

  const [state, stateDispatch] = useReducer(reducer, INITIAL_STATE);

  const hasMaterialize :boolean = useSelector(selectCurrentAuthorization(dataSetKey, PermissionTypes.MATERIALIZE));
  const dataSetSchema = useSelector(selectDataSetSchema(dataSetId));

  const myKeys :Set<List<UUID>> = useSelector(selectMyKeys());
  const isDataSetOwner :boolean = myKeys.has(dataSetKey);
  const isOrgOwner :boolean = myKeys.has(List([organizationId]));

  const dataSet :Map<FQN, List> = useSelector(selectOrgDataSet(organizationId, dataSetId));
  const dataSetName :string = getPropertyValue(dataSet, [FQNS.OL_DATA_SET_NAME, 0]);
  const dataSetFlags :List<string> = getPropertyValue(dataSet, FQNS.OL_FLAGS, List());
  const isAtlas :boolean = isAtlasDataSet(dataSet);
  const isAssembled = isAtlas ? false : dataSetFlags.includes(EntitySetFlagTypes.TRANSPORTED);
  const isPromoted = dataSetSchema === OPENLATTICE;

  useEffect(() => {
    if (isAtlas) {
      dispatch(getOrganizationDataSetSchema({
        dataSetId,
        organizationId,
      }));
    }
  }, [
    dataSetId,
    dispatch,
    isAtlas,
    organizationId,
  ]);

  const goToManagePermissions = useGoToRoute(
    Routes.ORG_DATA_SET_OBJECT_PERMISSIONS
      .replace(Routes.ORG_ID_PARAM, organizationId)
      .replace(Routes.DATA_SET_ID_PARAM, dataSetId)
  );

  const goToDataSetAccessRequest = useGoToRoute(
    Routes.ORG_DATA_SET_ACCESS_REQUEST
      .replace(Routes.ORG_ID_PARAM, organizationId)
      .replace(Routes.DATA_SET_ID_PARAM, dataSetId)
  );

  const goToDataSetAccessRequests = useGoToRoute(
    Routes.ORG_DATA_SET_ACCESS_REQUESTS
      .replace(Routes.ORG_ID_PARAM, organizationId)
      .replace(Routes.DATA_SET_ID_PARAM, dataSetId)
  );

  const anchorRef = useRef(null);

  const handleOpenMenu = () => {
    stateDispatch({ type: OPEN_MENU });
  };

  const handleCloseMenu = () => {
    stateDispatch({ type: CLOSE_MENU });
  };

  const handleOpenPromote = () => {
    stateDispatch({ type: OPEN_PROMOTE_DIALOG });
  };

  const handleClosePromote = () => {
    stateDispatch({ type: CLOSE_PROMOTE_DIALOG });
  };

  return (
    <>
      <IconButton
          aria-controls={state.menuOpen ? 'dataset-action-menu' : undefined}
          aria-expanded={state.menuOpen ? 'true' : undefined}
          aria-haspopup="menu"
          aria-label="dataset action button"
          onClick={handleOpenMenu}
          ref={anchorRef}
          variant="text">
        <FontAwesomeIcon fixedWidth icon={faEllipsisV} />
      </IconButton>
      <Menu
          anchorEl={anchorRef.current}
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'bottom',
          }}
          elevation={4}
          getContentAnchorEl={null}
          id="dataset-action-menu"
          onClose={handleCloseMenu}
          open={state.menuOpen}
          transformOrigin={{
            horizontal: 'right',
            vertical: 'top',
          }}>
        {
          isAtlas && (
            <MenuItem disabled={!isOrgOwner || isPromoted} onClick={handleOpenPromote}>
              {
                isPromoted
                  ? 'Promoted'
                  : 'Promote Data Set'
              }
            </MenuItem>
          )
        }
        {
          !isAtlas && (
            <AssembleMenuItem
                disabled={!hasMaterialize || isAtlas}
                entitySetId={dataSetId}
                isAssembled={isAssembled}
                organizationId={organizationId} />
          )
        }
        {
          isDataSetOwner && (
            <MenuItem onClick={goToManagePermissions}>
              Manage Permissions
            </MenuItem>
          )
        }
        {
          isDataSetOwner
            ? (
              <MenuItem onClick={goToDataSetAccessRequests}>
                Review Access Requests
              </MenuItem>
            )
            : (
              <MenuItem onClick={goToDataSetAccessRequest}>
                Request Access
              </MenuItem>
            )
        }
      </Menu>
      <PromoteTableModal
          dataSetId={dataSetId}
          dataSetName={dataSetName}
          isVisible={state.promoteOpen}
          onClose={handleClosePromote}
          organizationId={organizationId} />
    </>
  );
};

export default DataSetActionButton;
