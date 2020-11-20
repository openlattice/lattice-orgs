/*
 * @flow
 */

import React, { useEffect } from 'react';

import { Map } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import { PrincipalsApiActions } from 'lattice-sagas';
import { AppContentWrapper, Input, Typography } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UserInfo } from 'lattice-auth';
import type { RequestState } from 'redux-reqseq';

import { clearAtlasCredentials } from './actions';

import {
  ActionsGrid,
  CopyButton,
  Pre,
  Spinner,
  StackGrid,
} from '../../components';
import { ACCOUNT } from '../../core/redux/constants';
import { selectAtlasCredentials } from '../../core/redux/selectors';
import { clipboardWriteText } from '../../utils';

const { GET_ATLAS_CREDENTIALS, getAtlasCredentials } = PrincipalsApiActions;

const DASHES :'---' = '---';

const PasswordInput = (
  <Input disabled type="password" value="********************************" />
);

const AccountContainer = () => {

  const dispatch = useDispatch();

  const getAtlasCredentialsRS :?RequestState = useRequestState([ACCOUNT, GET_ATLAS_CREDENTIALS]);
  const atlasCredentials :Map = useSelector(selectAtlasCredentials());

  const thisUserInfo :UserInfo = AuthUtils.getUserInfo() || {};

  useEffect(() => {
    dispatch(getAtlasCredentials());
  }, [dispatch]);

  useEffect(() => () => {
    dispatch(clearAtlasCredentials());
  }, [dispatch]);

  if (getAtlasCredentialsRS === RequestStates.PENDING || getAtlasCredentialsRS === RequestStates.STANDBY) {
    return (
      <AppContentWrapper>
        <Spinner />
      </AppContentWrapper>
    );
  }

  return (
    <AppContentWrapper>
      <StackGrid>
        <Typography variant="h1">Account Details</Typography>
        <div>
          <Typography component="h2" variant="body2">FIRST NAME</Typography>
          <Typography>{thisUserInfo.givenName || DASHES}</Typography>
        </div>
        <div>
          <Typography component="h2" variant="body2">LAST NAME</Typography>
          <Typography>{thisUserInfo.familyName || DASHES}</Typography>
        </div>
        <div>
          <Typography component="h2" variant="body2">EMAIL</Typography>
          <Typography>{thisUserInfo.email || DASHES}</Typography>
        </div>
        <StackGrid gap={4}>
          <Typography component="h2" variant="body2">USER ID</Typography>
          <ActionsGrid align={{ v: 'center' }} fit>
            <Pre>{thisUserInfo.id}</Pre>
            <CopyButton
                aria-label="copy user id"
                onClick={() => clipboardWriteText(thisUserInfo.id)} />
          </ActionsGrid>
        </StackGrid>
        <StackGrid gap={4}>
          <Typography component="h2" variant="body2">AUTH0 JWT TOKEN</Typography>
          <ActionsGrid fit>
            {PasswordInput}
            <CopyButton
                aria-label="copy auth0 jwt token"
                onClick={() => clipboardWriteText(AuthUtils.getAuthToken())} />
          </ActionsGrid>
        </StackGrid>
        {
          getAtlasCredentialsRS === RequestStates.SUCCESS && (
            <>
              <StackGrid gap={4}>
                <Typography component="h2" variant="body2">ATLAS USERNAME</Typography>
                <ActionsGrid fit>
                  {PasswordInput}
                  <CopyButton
                      aria-label="copy atlas username"
                      onClick={() => clipboardWriteText(atlasCredentials.get('username'))} />
                </ActionsGrid>
              </StackGrid>
              <StackGrid gap={4}>
                <Typography component="h2" variant="body2">ATLAS CREDENTIAL</Typography>
                <ActionsGrid fit>
                  {PasswordInput}
                  <CopyButton
                      aria-label="copy atlas credential"
                      onClick={() => clipboardWriteText(atlasCredentials.get('credential'))} />
                </ActionsGrid>
              </StackGrid>
            </>
          )
        }
      </StackGrid>
    </AppContentWrapper>
  );
};

export default AccountContainer;
