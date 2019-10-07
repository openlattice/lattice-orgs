/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { faTrashAlt } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  IconButton,
  Input,
  Modal,
  Spinner,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as ReduxActions from '../../../core/redux/ReduxActions';

const { DELETE_ORGANIZATION } = OrganizationsApiActions;

const DeleteOrgButton = styled(IconButton)`
  align-self: center;
  margin: 80px 0 50px 0;
  width: 300px;
`;

const MinWidth = styled.div`
  min-width: 500px;
`;

const TrashIcon = (
  <FontAwesomeIcon icon={faTrashAlt} />
);

type Props = {
  actions :{
    deleteOrganization :RequestSequence;
    resetRequestState :(actionType :string) => void;
  };
  org :Map;
  requestStates :{
    DELETE_ORGANIZATION :RequestState;
  };
};

type State = {
  deleteConfirmationText :string;
  isValidConfirmation :boolean;
  isVisible :boolean;
}

class DeleteOrgModal extends Component<Props, State> {

  constructor(props :Props) {

    super(props);
    this.state = {
      deleteConfirmationText: '',
      isValidConfirmation: true,
      isVisible: false,
    };
  }

  componentWillUnmount() {

    const { actions } = this.props;
    actions.resetRequestState(DELETE_ORGANIZATION);
  }

  handleOnChangeDeleteConfirmation = (event :SyntheticInputEvent<HTMLInputElement>) => {

    this.setState({
      deleteConfirmationText: event.target.value || '',
      isValidConfirmation: true,
    });
  }

  delete = () => {

    const { actions, org } = this.props;
    const { deleteConfirmationText } = this.state;

    if (deleteConfirmationText === org.get('title')) {
      actions.deleteOrganization(org.get('id'));
      this.setState({ deleteConfirmationText: '' });
    }
    else {
      this.setState({ isValidConfirmation: false });
    }
  }

  close = () => {

    this.setState({
      deleteConfirmationText: '',
      isValidConfirmation: true,
      isVisible: false,
    });
  }

  open = () => {

    this.setState({ isVisible: true });
  }

  renderConfirmInput = () => {

    const { isValidConfirmation } = this.state;
    return (
      <>
        <span>To confirm, please type the organization name.</span>
        <Input invalid={!isValidConfirmation} onChange={this.handleOnChangeDeleteConfirmation} />
      </>
    );
  }

  render() {

    const { requestStates } = this.props;
    const { isVisible } = this.state;

    let withFooter = true;
    let body = (
      <>
        <span>Are you absolutely sure you want to delete this organization?</span>
        <br />
        {this.renderConfirmInput()}
      </>
    );

    if (requestStates[DELETE_ORGANIZATION] === RequestStates.PENDING) {
      body = (
        <Spinner size="2x" />
      );
      withFooter = false;
    }

    if (requestStates[DELETE_ORGANIZATION] === RequestStates.FAILURE) {
      body = (
        <>
          <span>Delete failed, please try again.</span>
          <br />
          {this.renderConfirmInput()}
        </>
      );
    }

    if (requestStates[DELETE_ORGANIZATION] === RequestStates.SUCCESS) {
      body = (
        <div>The organization has been deleted.</div>
      );
      withFooter = false;
    }

    return (
      <>
        <DeleteOrgButton icon={TrashIcon} mode="negative" onClick={this.open}>
          <span>Delete Organization</span>
        </DeleteOrgButton>
        <Modal
            isVisible={isVisible}
            onClickPrimary={this.close}
            onClickSecondary={this.delete}
            onClose={this.close}
            textPrimary="No, cancel"
            textSecondary="Yes, delete"
            textTitle="Delete Organization"
            withFooter={withFooter}>
          {body}
          <MinWidth />
        </Modal>
      </>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  requestStates: {
    [DELETE_ORGANIZATION]: state.getIn(['orgs', DELETE_ORGANIZATION, 'requestState']),
  },
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    deleteOrganization: OrganizationsApiActions.deleteOrganization,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(DeleteOrgModal);
