/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import _capitalize from 'lodash/capitalize';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  CardSegment,
  Checkbox,
  ModalFooter as LUKModalFooter,
  Typography
} from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Principal, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import SearchOrgDataSetsContainer from '../../org/components/dataset/SearchOrgDataSetsContainer';
import StepConfirm from '../StepConfirm';
import StepSelectPermissions from '../StepSelectPermissions';
import {
  DataSetTitle,
  ModalBody,
  SpaceBetweenGrid,
  StepsController,
} from '../../../components';
import { ASSIGN_PERMISSIONS_TO_DATA_SET, assignPermissionsToDataSet } from '../../../core/permissions/actions';
import { resetRequestStates } from '../../../core/redux/actions';
import { PERMISSIONS } from '../../../core/redux/constants';
import { SEARCH_ORGANIZATION_DATA_SETS, clearSearchState } from '../../../core/search/actions';
import {
  ID,
  METADATA,
  NAME,
  TITLE,
} from '../../../utils/constants';

const ModalFooter = styled(LUKModalFooter)`
  padding: 30px 0;
`;

const AssignPermissionsToDataSetModalBody = ({
  onClose,
  organizationId,
  principal,
} :{
  onClose :() => void;
  organizationId :UUID;
  principal :Principal;
}) => {

  const dispatch = useDispatch();

  const [assignPermissionsToAllProperties, setAssignPermissionsToAllProperties] = useState(true);
  const [targetDataSetIds, setTargetDataSetIds] = useState(List());
  const [targetDataSetTitles, setTargetDataSetTitles] = useState(List());
  const [targetPermissionOptions, setTargetPermissionOptions] = useState([]);

  const assignPermissionsToDataSetRS :?RequestState = useRequestState([PERMISSIONS, ASSIGN_PERMISSIONS_TO_DATA_SET]);

  useEffect(() => () => {
    dispatch(clearSearchState(SEARCH_ORGANIZATION_DATA_SETS));
    dispatch(resetRequestStates([ASSIGN_PERMISSIONS_TO_DATA_SET]));
  }, [dispatch]);

  const onConfirm = () => {
    dispatch(
      assignPermissionsToDataSet({
        dataSetIds: targetDataSetIds,
        organizationId,
        permissionTypes: targetPermissionOptions.map((option) => option.value),
        principal,
        withColumns: assignPermissionsToAllProperties,
      })
    );
  };

  const isSuccess = assignPermissionsToDataSetRS === RequestStates.SUCCESS;

  const permissions = targetPermissionOptions
    .map((option) => option.value)
    .map(_capitalize)
    .join(', ');

  const confirmText = assignPermissionsToAllProperties
    ? (
      <>
        <Typography>
          {
            `Please confirm you want to assign ${permissions} the following `
              + 'datasets and all of their columns:'
          }
        </Typography>
        <ul>
          {
            targetDataSetTitles.map((title) => <li>{title}</li>)
          }
        </ul>
      </>
    )
    : (
      <>
        <Typography>
          {
            `Please confirm you want to assign ${permissions} the `
              + 'following datasets (not all of their columns):'
          }
        </Typography>
        <ul>
          {
            targetDataSetTitles.map((title) => <li>{title}</li>)
          }
        </ul>
      </>
    );

  const handleOnChangeSelectDataSet = (event :SyntheticInputEvent<HTMLInputElement>) => {
    const { id, title } = event.currentTarget.dataset;
    if (targetDataSetIds.includes(id)) {
      setTargetDataSetIds(targetDataSetIds.filter((dataSetId) => dataSetId !== id));
    }
    else {
      setTargetDataSetIds(targetDataSetIds.push(id));
    }
    if (targetDataSetTitles.includes(title)) {
      setTargetDataSetTitles(targetDataSetTitles.filter((dataSetTitle) => dataSetTitle !== title));
    }
    else {
      setTargetDataSetTitles(targetDataSetTitles.push(title));
    }
  };

  return (
    <StepsController>
      {
        ({ step, stepBack, stepNext }) => (
          <>
            {
              step === 0 && (
                <>
                  <ModalBody>
                    <Typography gutterBottom>Search for target data sets.</Typography>
                    <SearchOrgDataSetsContainer organizationId={organizationId}>
                      {(dataSets :List<Map>) => (
                        <div>
                          {
                            dataSets.map((dataSet :Map) => {
                              const id :UUID = dataSet.get(ID);
                              const name :string = dataSet.get(NAME);
                              const title :string = dataSet.getIn([METADATA, TITLE]);
                              return (
                                <CardSegment key={id} padding="8px 0">
                                  <SpaceBetweenGrid>
                                    <div>
                                      <DataSetTitle dataSet={dataSet} />
                                      <Typography variant="caption">{id}</Typography>
                                    </div>
                                    <Checkbox
                                        checked={targetDataSetIds.includes(id)}
                                        data-id={id}
                                        data-title={title || name}
                                        name="select-data-set"
                                        onChange={handleOnChangeSelectDataSet} />
                                  </SpaceBetweenGrid>
                                </CardSegment>
                              );
                            })
                          }
                        </div>
                      )}
                    </SearchOrgDataSetsContainer>
                  </ModalBody>
                  <ModalFooter
                      onClickPrimary={stepNext}
                      onClickSecondary={stepBack}
                      shouldStretchButtons
                      textPrimary="Continue"
                      textSecondary="" />
                </>
              )
            }
            {
              step === 1 && (
                <>
                  <ModalBody>
                    <StepSelectPermissions
                        assignPermissionsToAllProperties={assignPermissionsToAllProperties}
                        isDataSet={!targetDataSetIds.isEmpty()}
                        setAssignPermissionsToAllProperties={setAssignPermissionsToAllProperties}
                        setTargetPermissionOptions={setTargetPermissionOptions}
                        targetTitles={targetDataSetTitles}
                        targetPermissionOptions={targetPermissionOptions} />
                  </ModalBody>
                  <ModalFooter
                      onClickPrimary={stepNext}
                      onClickSecondary={stepBack}
                      shouldStretchButtons
                      textPrimary="Continue"
                      textSecondary="Back" />
                </>
              )
            }
            {
              step === 2 && (
                <>
                  <ModalBody>
                    <StepConfirm
                        confirmText={confirmText}
                        requestState={assignPermissionsToDataSetRS} />
                  </ModalBody>
                  <ModalFooter
                      isPendingPrimary={assignPermissionsToDataSetRS === RequestStates.PENDING}
                      onClickPrimary={isSuccess ? onClose : onConfirm}
                      onClickSecondary={stepBack}
                      shouldStretchButtons
                      textPrimary={isSuccess ? 'Close' : 'Confirm'}
                      textSecondary={isSuccess ? '' : 'Back'} />
                </>
              )
            }
          </>
        )
      }
    </StepsController>
  );
};

export default AssignPermissionsToDataSetModalBody;
