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
import { Map } from 'immutable';
import { PrincipalsApiActions } from 'lattice-sagas';
import { Select } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';

import { USERS, USER_SEARCH_RESULTS } from '../../../core/redux/constants';
import { resetUserSearchResults } from '../../../core/users/actions';
import { getUserTitle } from '../../../utils';
import type { ReactSelectOption } from '../../../types';

const { SEARCH_ALL_USERS, searchAllUsers } = PrincipalsApiActions;

type Props = {
  onChange :(option ?:ReactSelectOption<Map>) => void;
};

const SearchMemberBar = ({
  onChange,
} :Props) => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const searchRequestState = useRequestState([USERS, SEARCH_ALL_USERS]);
  const userSearchResults = useSelector((store) => store.getIn([USERS, USER_SEARCH_RESULTS]));

  const options = useMemo(() => {
    const selectOptions = [];
    userSearchResults.forEach((user) => {
      selectOptions.push({
        label: getUserTitle(user),
        value: user,
      });
    }, [userSearchResults]);

    return selectOptions;
  }, [userSearchResults]);

  const debounceDispatchSearch = useCallback(debounce((value) => {
    if (value) {
      dispatch(searchAllUsers(value));
    }
    else {
      dispatch(resetUserSearchResults());
    }
  }, 250), []);

  useEffect(() => {
    debounceDispatchSearch(searchTerm.trim());
  }, [debounceDispatchSearch, searchTerm]);

  const handleInputChange = (query, { action }) => {
    if (action === 'input-change') {
      setSearchTerm(query);
    }
  };

  return (
    <Select
        hideDropdownIcon
        inputIcon={<FontAwesomeIcon icon={faSearch} />}
        isClearable
        closeMenuOnSelect={false}
        value={null}
        isLoading={searchRequestState === RequestStates.PENDING}
        onChange={onChange}
        onInputChange={handleInputChange}
        inputValue={searchTerm}
        options={options}
        placeholder="Search members" />
  );
};

export default SearchMemberBar;
