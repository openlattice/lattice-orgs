/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import { List, Map } from 'immutable';
import {
  CardSegment,
  Checkbox,
  Select,
  Typography,
} from 'lattice-ui-kit';
import { ReduxUtils, useRequestState, useStepState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import SearchOrgDataSetsContainer from '../../org/components/dataset/SearchOrgDataSetsContainer';
import StyledFooter from '../../org/components/styled/StyledFooter';
import {
  DataSetTitle,
  ModalBody,
  ResetOnUnmount,
  SpaceBetweenGrid,
  StackGrid,
} from '../../../components';
import { DataSetTypes } from '../../../core/edm/constants';
import { COLLABORATIONS } from '../../../core/redux/constants';
import { selectCollaboration, selectMyKeys, selectOrganizations } from '../../../core/redux/selectors';
import {
  ID,
  METADATA,
  NAME,
  ORGANIZATION_IDS,
  TITLE,
} from '../../../utils/constants';
import { ADD_DATA_SETS_TO_COLLABORATION, addDataSetsToCollaboration } from '../actions';
import type { ReactSelectOption } from '../../../types';

const { isPending, isStandby, isSuccess } = ReduxUtils;

const RESET_ACTIONS = [ADD_DATA_SETS_TO_COLLABORATION];

const AddDataSetToCollaborationModalBody = ({
  collaborationId,
  existingDataSets,
  onClose,
  setModalTitle
} :{
  collaborationId :UUID;
  existingDataSets :List;
  onClose :() => void;
  setModalTitle :(title :string) => void;
}) => {

  const dispatch = useDispatch();
  const [step, stepBack, stepNext] = useStepState(3);
  const [targetDataSetIds, setTargetDataSetIds] = useState(List());
  const [targetDataSetTitles, setTargetDataSetTitles] = useState(List());
  const [targetOrganizationId, setTargetOrganizationId] = useState('');
  const addDataSetToCollaborationRS :?RequestState = useRequestState([COLLABORATIONS, ADD_DATA_SETS_TO_COLLABORATION]);

  const collaboration :Map<UUID, List<UUID>> = useSelector(selectCollaboration(collaborationId));
  const organizationIds :List<UUID> = collaboration.get(ORGANIZATION_IDS, List());
  const organizations :Map<UUID, Organization> = useSelector(selectOrganizations());
  const myKeys :Set<List<UUID>> = useSelector(selectMyKeys());

  const pending = isPending(addDataSetToCollaborationRS);
  const standby = isStandby(addDataSetToCollaborationRS);
  const success = isSuccess(addDataSetToCollaborationRS);

  const orgOptions = organizationIds
    .filter((orgId) => organizations.has(orgId))
    .map((orgId) => {
      const organization = organizations.get(orgId);
      const label = organization.title;
      const value = organization.id;
      return { label, value };
    })
    .toJS();

  useEffect(() => {
    if (step === 0) {
      setModalTitle('Select Organization');
    }
    else if (step === 1) {
      setModalTitle('Add Data Sets');
    }
    else if (standby && step === 2) {
      setModalTitle('Add these data sets?');
    }
    else if (success && step === 2) {
      setModalTitle('Data Sets Added');
    }
  }, [setModalTitle, standby, step, success]);

  const handleOrgSelect = (organizationOption :ReactSelectOption<UUID>) => {
    setTargetOrganizationId(organizationOption.value);
  };

  const handleOnClickPrimary = () => {
    dispatch(
      addDataSetsToCollaboration({
        collaborationId,
        dataSetIdsByOrgId: Map({
          [targetOrganizationId]: targetDataSetIds
        })
      })
    );
  };

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
    <>
      {
        step === 0 && (
          <>
            <ModalBody>
              <StackGrid gap={16}>
                <Typography gutterBottom htmlFor="select organization">
                  Which organization would you like to add a data set from?
                </Typography>
                <Select
                    id="select organization"
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: (provided) => ({ ...provided, zIndex: 9999 }) }}
                    onChange={handleOrgSelect}
                    options={orgOptions}
                    placeholder="select organization" />
              </StackGrid>
            </ModalBody>
            <StyledFooter
                isDisabledPrimary={!targetOrganizationId}
                onClickPrimary={stepNext}
                textPrimary="Next: Select Data Sets" />
          </>
        )
      }
      {
        step === 1 && (
          <>
            <ModalBody>
              <StackGrid gap={16}>
                <Typography gutterBottom>Search and select data set(s) to add to this collaboration.</Typography>
                <SearchOrgDataSetsContainer
                    filterByDataSetType={DataSetTypes.EXTERNAL_TABLE}
                    organizationId={targetOrganizationId}>
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
                                    checked={targetDataSetIds.includes(id) || existingDataSets.includes(id)}
                                    data-id={id}
                                    data-title={title || name}
                                    disabled={existingDataSets.includes(id) || !myKeys.has(List([id]))}
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
              </StackGrid>
            </ModalBody>
            <StyledFooter
                isDisabledPrimary={!targetDataSetIds.size}
                onClickPrimary={stepNext}
                textPrimary="Next: Review Selection" />

          </>
        )
      }
      {
        step === 2 && (
          <>
            <ModalBody>
              <ResetOnUnmount actions={RESET_ACTIONS}>
                <StackGrid gap={16}>
                  {
                    success
                      ? (
                        <>
                          <Typography>
                            {
                              `${targetDataSetTitles.size} data ${targetDataSetTitles.size === 1 ? 'set' : 'sets'} `
                                + 'successfully added to collaboration.'
                            }
                          </Typography>
                        </>
                      )
                      : (
                        <>
                          <ol>
                            {
                              targetDataSetTitles.map((title) => <li>{title}</li>)
                            }
                          </ol>
                        </>
                      )
                  }
                </StackGrid>
              </ResetOnUnmount>
            </ModalBody>
            <StyledFooter
                isPendingPrimary={pending}
                onClickPrimary={success ? onClose : handleOnClickPrimary}
                onClickSecondary={stepBack}
                textPrimary={success ? 'Close' : 'Add Data Sets'}
                textSecondary={success ? '' : 'Change Selection'} />
          </>
        )
      }
    </>
  );
};

export default AddDataSetToCollaborationModalBody;
