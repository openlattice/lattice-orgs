/*
 * @flow
 */

import React, {
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';

import { faEllipsisV } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import { Types } from 'lattice';
import { DataSetsApiActions } from 'lattice-sagas';
// $FlowFixMe
import { IconButton, Menu, MenuItem } from 'lattice-ui-kit';
import { DataUtils, useGoToRoute, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { FQN, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import AssembleMenuItem from './AssembleMenuItem';
import PromoteTableModal from './PromoteTableModal';

import { UpdateMetaModal } from '../../../../components';
import { UPDATE_ORGANIZATION_DATA_SET, updateOrganizationDataSet } from '../../../../core/edm/actions';
import { FQNS } from '../../../../core/edm/constants';
import { EDM } from '../../../../core/redux/constants';
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
const { getEntityKeyId, getPropertyValue } = DataUtils;

const CLOSE_DETAILS = 'CLOSE_DETAILS';
const CLOSE_MENU = 'CLOSE_MENU';
const CLOSE_PROMOTE_DIALOG = 'CLOSE_PROMOTE_DIALOG';
const OPEN_DETAILS = 'OPEN_DETAILS';
const OPEN_MENU = 'OPEN_MENU';
const OPEN_PROMOTE_DIALOG = 'OPEN_PROMOTE_DIALOG';

const INITIAL_STATE = {
  detailsOpen: false,
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
    case CLOSE_DETAILS:
      return {
        ...state,
        detailsOpen: false,
      };
    case OPEN_DETAILS:
      return {
        ...state,
        detailsOpen: true,
        menuOpen: false,
      };
    default:
      return state;
  }
};

const DATA_SCHEMA = {
  properties: {
    fields: {
      properties: {
        title: {
          description: 'Update this data set\'s title',
          title: 'Title',
          type: 'string',
        },
        description: {
          description: 'Update this data set\'s description',
          title: 'Description',
          type: 'string',
        },
      },
      required: ['title'],
      title: '',
      type: 'object',
    },
  },
  title: '',
  type: 'object',
};

const UI_SCHEMA = {
  fields: {
    classNames: 'column-span-12 grid-container',
    title: {
      classNames: 'column-span-12',
    },
    description: {
      classNames: 'column-span-12',
      'ui:widget': 'textarea',
    },
  },
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
  const [schema, setSchema] = useState({ dataSchema: DATA_SCHEMA, uiSchema: UI_SCHEMA });

  const updateOrgDataSetRS :?RequestState = useRequestState([EDM, UPDATE_ORGANIZATION_DATA_SET]);

  const hasMaterialize :boolean = useSelector(selectCurrentAuthorization(dataSetKey, PermissionTypes.MATERIALIZE));
  const dataSetSchema = useSelector(selectDataSetSchema(dataSetId));

  const myKeys :Set<List<UUID>> = useSelector(selectMyKeys());
  const isDataSetOwner :boolean = myKeys.has(dataSetKey);
  const isOrgOwner :boolean = myKeys.has(List([organizationId]));

  const dataSet :Map<FQN, List> = useSelector(selectOrgDataSet(organizationId, dataSetId));
  const dataSetDescription :string = getPropertyValue(dataSet, [FQNS.OL_DESCRIPTION, 0]);
  const dataSetName :string = getPropertyValue(dataSet, [FQNS.OL_DATA_SET_NAME, 0]);
  const dataSetFlags :List<string> = getPropertyValue(dataSet, FQNS.OL_FLAGS, List());
  const dataSetTitle :string = getPropertyValue(dataSet, [FQNS.OL_TITLE, 0]);
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

  useEffect(() => {
    const dataSchema = JSON.parse(JSON.stringify(DATA_SCHEMA));
    dataSchema.properties.fields.properties.title.default = dataSetTitle;
    dataSchema.properties.fields.properties.description.default = dataSetDescription;
    setSchema({ dataSchema, uiSchema: UI_SCHEMA });
  }, [dataSetDescription, dataSetTitle]);

  const goToManagePermissions = useGoToRoute(
    Routes.ORG_DATA_SET_OBJECT_PERMISSIONS
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

  const handleOpenDetails = () => {
    stateDispatch({ type: OPEN_DETAILS });
  };

  const handleCloseDetails = () => {
    stateDispatch({ type: CLOSE_DETAILS });
  };

  const handleOnSubmitUpdate = ({ description, title }) => {
    dispatch(
      updateOrganizationDataSet({
        dataSetId,
        description,
        entityKeyId: getEntityKeyId(dataSet),
        isColumn: false,
        organizationId,
        title,
      })
    );
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
        <MenuItem disabled={!isDataSetOwner} onClick={handleOpenDetails}>
          Edit Details
        </MenuItem>
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
      </Menu>
      <PromoteTableModal
          dataSetId={dataSetId}
          dataSetName={dataSetName}
          isVisible={state.promoteOpen}
          onClose={handleClosePromote}
          organizationId={organizationId} />
      <UpdateMetaModal
          isVisible={state.detailsOpen}
          onClose={handleCloseDetails}
          onSubmit={handleOnSubmitUpdate}
          requestState={updateOrgDataSetRS}
          requestStateAction={UPDATE_ORGANIZATION_DATA_SET}
          schema={schema} />
    </>
  );
};

export default DataSetActionButton;
