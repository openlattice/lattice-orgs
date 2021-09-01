/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import { List, Map } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';
import { ReduxUtils, useRequestState, useStepState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import StyledFooter from '../../org/components/styled/StyledFooter';
import SelectOrganizationsToAddToCollaboration from './SelectOrganizationsToAddToCollaboration';
import { ModalBody, ResetOnUnmount } from '../../../components';
import { COLLABORATIONS } from '../../../core/redux/constants';
import { ORGANIZATION_IDS } from '../../../utils/constants';
import { selectCollaboration, selectOrganizations } from '../../../core/redux/selectors';

const { isPending, isFailure, isSuccess } = ReduxUtils;

const { ADD_ORGANIZATIONS_TO_COLLABORATION, addOrganizationsToCollaboration } = CollaborationsApiActions;

const RESET_ACTIONS = [ADD_ORGANIZATIONS_TO_COLLABORATION];

const AddOrganizationsToCollaborationModalBody = ({
  collaborationId,
  onClose
} :{
  collaborationId :UUID;
  onClose :() => void;
}) => {

  const dispatch = useDispatch();

  const [collaborationOrganizations, setCollaborationOrganizations] = useState([]);
  const [step, stepBack, stepNext] = useStepState(2);

  const collaboration :Map<UUID, List<UUID>> = useSelector(selectCollaboration(collaborationId));
  const organizationIds :List<UUID> = collaboration.get(ORGANIZATION_IDS, List());
  const organizations :Map<UUID, Organization> = useSelector(selectOrganizations());
  const addOrgsToCollaborationRS :?RequestState = useRequestState([COLLABORATIONS, ADD_ORGANIZATIONS_TO_COLLABORATION]);

  const options = useMemo(() => {
    const selectOptions = [];
    organizations.forEach((org) => {
      if (!organizationIds.includes(org.id)) {
        selectOptions.push({
          key: org.id,
          label: org.title,
          value: org.id,
        });
      }
    });

    return selectOptions;
  }, [organizations, organizationIds]);

  const handleOnClickPrimary = () => {
    dispatch(
      addOrganizationsToCollaboration({
        collaborationId,
        organizationIds: collaborationOrganizations
      })
    );
  };

  const pending = isPending(addOrgsToCollaborationRS);
  const failure = isFailure(addOrgsToCollaborationRS);
  const success = isSuccess(addOrgsToCollaborationRS);

  useEffect(() => {
    if (success || failure) {
      stepNext();
      setCollaborationOrganizations([]);
    }
  }, [failure, stepNext, success]);

  return (
    <>
      {
        step === 0 && (
          <>
            <ModalBody>
              <SelectOrganizationsToAddToCollaboration
                  collaborationId={collaborationId}
                  options={options}
                  setCollaborationOrganizations={setCollaborationOrganizations} />
            </ModalBody>
            <StyledFooter
                isLoadingPrimary={pending}
                isDisabledPrimary={!collaborationOrganizations.length}
                onClickPrimary={handleOnClickPrimary}
                textPrimary="Add Organization(s)" />
          </>
        )
      }
      {
        step === 1 && (
          <>
            <ModalBody>
              {
                success && (
                  <ResetOnUnmount actions={RESET_ACTIONS}>
                    <span>
                      {
                        `${collaborationOrganizations.length === 1 ? 'Organization' : 'Organizations'} `
                          + 'successfully added to collaboration!'
                      }
                    </span>
                  </ResetOnUnmount>
                )
              }
              {
                failure && (
                  <ResetOnUnmount actions={RESET_ACTIONS}>
                    <span>
                      {
                        'Failed to add '
                          + `${collaborationOrganizations.length === 1 ? 'organization' : 'organizations'} `
                        + 'to collaboration. Please try again.'
                      }
                    </span>
                  </ResetOnUnmount>
                )
              }
            </ModalBody>
            <StyledFooter
                onClickPrimary={onClose}
                onClickSecondary={stepBack}
                textPrimary="Close"
                textSecondary={failure ? 'Try Again' : null} />
          </>
        )
      }
    </>
  );
};

export default AddOrganizationsToCollaborationModalBody;
