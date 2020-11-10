/*
 * @flow
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import debounce from 'lodash/debounce';
import { faSearch } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PrincipalsApiActions } from 'lattice-sagas';
import { Select } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';

import { USERS, USER_SEARCH_RESULTS } from '../../../core/redux/constants';
import { getUserProfileLabel } from '../../../utils/PersonUtils';
import type { ReactSelectOption } from '../../../types';

const { SEARCH_ALL_USERS, searchAllUsers } = PrincipalsApiActions;

type Props = {
  onChange :(option :?ReactSelectOption<string>) => void;
};

const SearchMemberBar = ({ onChange } :Props) => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const searchRequestState = useRequestState([USERS, SEARCH_ALL_USERS]);
  const userSearchResults = useSelector((store) => store.getIn([USERS, USER_SEARCH_RESULTS]));

  const options = useMemo(() => {
    const selectOptions = [];
    userSearchResults.forEach((user, userId) => {
      selectOptions.push({
        label: getUserProfileLabel(user),
        value: userId,
      });
    }, [userSearchResults]);

    return selectOptions;
  }, [userSearchResults]);

  const debounceDispatchSearch = useCallback(debounce((value) => {
    dispatch(searchAllUsers(value));
  }, 250), []);

  useEffect(() => {
    debounceDispatchSearch(searchTerm.trim());
  }, [debounceDispatchSearch, searchTerm]);

  return (
    <Select
        hideDropdownIcon
        inputIcon={<FontAwesomeIcon icon={faSearch} />}
        isClearable
        isLoading={searchRequestState === RequestStates.PENDING}
        onChange={onChange}
        onInputChange={setSearchTerm}
        inputValue={searchTerm}
        options={options}
        placeholder="Search members" />
  );
};

export default SearchMemberBar;
