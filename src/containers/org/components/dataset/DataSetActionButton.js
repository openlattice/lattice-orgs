// @flow
import React, { useEffect, useReducer, useRef } from 'react';

import { faEllipsisH } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map, get, getIn } from 'immutable';
import { DataSetsApiActions } from 'lattice-sagas';
import { IconButton, Menu, MenuItem } from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'lattice';

import PromoteTableModal from './PromoteTableModal';

import { selectCurrentUserIsOrgOwner, selectDataSetSchema } from '../../../../core/redux/selectors';
import { OPENLATTICE } from '../../../../utils/constants';

const { getOrganizationDataSetSchema } = DataSetsApiActions;

const CLOSE_PROMOTE_DIALOG = 'CLOSE_PROMOTE_DIALOG';
const CLOSE_MENU = 'CLOSE_MENU';
const OPEN_PROMOTE_DIALOG = 'OPEN_PROMOTE_DIALOG';
const OPEN_MENU = 'OPEN_MENU';

const INITIAL_STATE = {
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
        menuOpen: false,
        promoteOpen: true,
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
  const dataSetId = isAtlas ? getIn(dataSet, ['table', 'id']) : get(dataSet, 'id');
  const isOwner :boolean = useSelector(selectCurrentUserIsOrgOwner(organizationId));
  const dataSetSchema = useSelector(selectDataSetSchema(dataSetId));
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
        <MenuItem disabled={!isOwner || !isAtlas || isPromoted} onClick={handleOpenPromote}>
          {
            isPromoted
              ? 'Promoted'
              : 'Promote Table'
          }
        </MenuItem>
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
