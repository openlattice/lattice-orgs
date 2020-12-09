// @flow
import React, { useEffect, useReducer, useRef } from 'react';

import { faEllipsisH } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  List,
  Map,
  get,
  getIn
} from 'immutable';
import { Types } from 'lattice';
import { DataSetsApiActions } from 'lattice-sagas';
import { IconButton, Menu, MenuItem } from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'lattice';

import AssembleMenuItem from './AssembleMenuItem';
import AssembleMenuItemContent from './AssembleMenuItemContent';
import PromoteTableModal from './PromoteTableModal';

import {
  selectCurrentAuthorization,
  selectCurrentUserIsOrgOwner,
  selectDataSetSchema
} from '../../../../core/redux/selectors';
import { OPENLATTICE } from '../../../../utils/constants';
import { getOrganizationsAndAuthorizations } from '../../../orgs/actions';

const { getOrganizationDataSetSchema } = DataSetsApiActions;
const { EntitySetFlagTypes, PermissionTypes } = Types;

const CLOSE_PROMOTE_DIALOG = 'CLOSE_PROMOTE_DIALOG';
const CLOSE_MENU = 'CLOSE_MENU';
const OPEN_PROMOTE_DIALOG = 'OPEN_PROMOTE_DIALOG';
const OPEN_MENU = 'OPEN_MENU';
const OPEN_ASSEMBLE_DIALOG = 'OPEN_ASSEMBLE_DIALOG';
const CLOSE_ASSEMBLE_DIALOG = 'CLOSE_ASSEMBLE_DIALOG';
const OPEN_DISASSEMBLE_DIALOG = 'OPEN_DISASSEMBLE_DIALOG';
const CLOSE_DISASSEMBLE_DIALOG = 'CLOSE_DISASSEMBLE_DIALOG';

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
    case OPEN_ASSEMBLE_DIALOG:
      return {
        ...state,
        assembleOpen: true,
        menuOpen: false,
      };
    case CLOSE_ASSEMBLE_DIALOG:
      return {
        ...state,
        assembleOpen: false,
      };
    case OPEN_DISASSEMBLE_DIALOG:
      return {
        ...state,
        disassembleOpen: true,
        menuOpen: false,
      };
    case CLOSE_DISASSEMBLE_DIALOG:
      return {
        ...state,
        disassembleOpen: false,
      };
    default:
      return state;
  }
};

type Props = {
  dataSet :Map;
  isAtlas :boolean;
  organizationId :UUID;
};

const DataSetActionButton = ({ dataSet, isAtlas, organizationId } :Props) => {
  const dispatch = useDispatch();
  const [state, stateDispatch] = useReducer(reducer, INITIAL_STATE);
  const dataSetId = isAtlas ? getIn(dataSet, ['table', 'id']) : dataSet.id;
  const isOrgOwner :boolean = useSelector(selectCurrentUserIsOrgOwner(organizationId));
  const hasMaterialize :boolean = useSelector(
    selectCurrentAuthorization(List([dataSetId]), PermissionTypes.MATERIALIZE)
  );
  const dataSetSchema = useSelector(selectDataSetSchema(dataSetId));
  const isPromoted = dataSetSchema === OPENLATTICE;
  const isAssembled = isAtlas ? false : get(dataSet, 'flags', []).includes(EntitySetFlagTypes.TRANSPORTED);

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

  const handleOpenAssemble = () => {
    stateDispatch({ type: OPEN_ASSEMBLE_DIALOG });
  };

  const handleOpenDisassemble = () => {
    stateDispatch({ type: OPEN_DISASSEMBLE_DIALOG });
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
        <FontAwesomeIcon icon={faEllipsisH} />
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
        <MenuItem disabled={!isOrgOwner || !isAtlas || isPromoted} onClick={handleOpenPromote}>
          {
            isPromoted
              ? 'Promoted'
              : 'Promote Data Set'
          }
        </MenuItem>
        <AssembleMenuItem
            disabled={!hasMaterialize || isAtlas}
            entitySetId={dataSetId}
            isAssembled={isAssembled}
            organizationId={organizationId} />
      </Menu>
      <PromoteTableModal
          dataSet={dataSet}
          isVisible={state.promoteOpen}
          onClose={handleClosePromote}
          organizationId={organizationId} />
    </>
  );
};

DataSetActionButton.defaultProps = {
  dataSet: Map(),
  isAtlas: false,
};

export default DataSetActionButton;
