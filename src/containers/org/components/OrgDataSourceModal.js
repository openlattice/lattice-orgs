/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import { Map, fromJS, get } from 'immutable';
import { Form } from 'lattice-fabricate';
import { OrganizationsApiActions } from 'lattice-sagas';
import { Modal, ModalFooter, Typography } from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ModalBody, ResetOnUnmount } from '../../../components';
import { ORGANIZATIONS } from '../../../core/redux/constants';

const {
  REGISTER_ORGANIZATION_DATA_SOURCE,
  UPDATE_ORGANIZATION_DATA_SOURCE,
  registerOrganizationDataSource,
  updateOrganizationDataSource,
} = OrganizationsApiActions;

const { isFailure, isPending, isSuccess } = ReduxUtils;

const dataSchema = {
  properties: {
    fields: {
      properties: {
        name: {
          title: 'Name',
          type: 'string',
        },
        url: {
          title: 'URL',
          type: 'string',
        },
        driver: {
          title: 'Driver',
          type: 'string',
        },
        database: {
          title: 'Database',
          type: 'string',
        },
        username: {
          title: 'Username',
          type: 'string',
        },
        password: {
          title: 'Password',
          type: 'string',
        },
        roleManager: {
          enum: [true, false],
          enumNames: ['Yes', 'No'],
          title: 'Role Manager',
          type: 'boolean',
        },
      },
      title: '',
      type: 'object',
    },
  },
  title: '',
  type: 'object',
};

const uiSchema = {
  fields: {
    classNames: 'column-span-12',
    roleManager: {
      'ui:options': { row: true },
      'ui:widget': 'radio',
      classNames: 'column-span-6',
    },
  }
};

type FormData = {|
  fields :{|
    database :?string;
    driver :?string;
    name :?string;
    password :?string;
    roleManager :?boolean;
    url :?string;
    username :?string;
  |};
|};

const INITIAL_FORM_DATA :FormData = {
  fields: {
    database: '',
    driver: '',
    name: '',
    password: '',
    roleManager: false,
    url: '',
    username: '',
  },
};

const RESET_PATHS = [
  [REGISTER_ORGANIZATION_DATA_SOURCE],
  [UPDATE_ORGANIZATION_DATA_SOURCE],
];

const OrgDataSourceModal = ({
  dataSource,
  isVisible,
  onClose,
  organizationId,
} :{|
  dataSource :Map;
  isVisible :boolean;
  onClose :() => void;
  organizationId :UUID;
|}) => {

  const dispatch = useDispatch();

  const isNewDataSource :boolean = dataSource.isEmpty();

  const [dataSourceFormData, setDataSourceFormData] = useState(INITIAL_FORM_DATA);
  const registerRS :?RequestState = useRequestState([ORGANIZATIONS, REGISTER_ORGANIZATION_DATA_SOURCE]);
  const updateRS :?RequestState = useRequestState([ORGANIZATIONS, UPDATE_ORGANIZATION_DATA_SOURCE]);

  useEffect(() => {
    if (isVisible) {
      const newFormData :FormData = fromJS(INITIAL_FORM_DATA).mergeIn(['fields'], dataSource).toJS();
      setDataSourceFormData(newFormData);
    }
  }, [dataSource, isVisible]);

  useEffect(() => {
    if (isSuccess(registerRS) || isSuccess(updateRS)) {
      onClose();
    }
  }, [onClose, registerRS, updateRS]);

  const handleOnChangeForm = ({ formData } :{ formData :FormData }) => {
    setDataSourceFormData(formData);
  };

  const handleOnClickPrimary = () => {
    if (isNewDataSource) {
      dispatch(
        registerOrganizationDataSource({
          dataSource: dataSourceFormData.fields,
          organizationId,
        })
      );
    }
    else {
      dispatch(
        updateOrganizationDataSource({
          dataSource: dataSourceFormData.fields,
          dataSourceId: get(dataSource, 'id', ''),
          organizationId,
        })
      );
    }
  };

  const withFooter = (
    <ModalFooter
        isPendingPrimary={isPending(registerRS) || isPending(updateRS)}
        isDisabledSecondary={isPending(registerRS) || isPending(updateRS)}
        onClickPrimary={handleOnClickPrimary}
        textPrimary={isNewDataSource ? 'Create' : 'Update'}
        withFooter />
  );

  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        textTitle={isNewDataSource ? 'Create Data Source' : 'Update Data Source'}
        withFooter={withFooter}>
      <ResetOnUnmount paths={RESET_PATHS}>
        <ModalBody>
          <Form
              formData={dataSourceFormData}
              hideSubmit
              noPadding
              onChange={handleOnChangeForm}
              schema={dataSchema}
              uiSchema={uiSchema} />
          {
            (isFailure(registerRS) || isFailure(updateRS)) && (
              <Typography color="error">
                {`Failed to ${isNewDataSource ? 'create' : 'update'} the data source. Please try again.`}
              </Typography>
            )
          }
        </ModalBody>
      </ResetOnUnmount>
    </Modal>
  );
};

export default OrgDataSourceModal;
