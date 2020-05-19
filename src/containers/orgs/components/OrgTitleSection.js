/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import { Form } from 'lattice-fabricate';
import { EditButton } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as ReduxActions from '../../../core/redux/ReduxActions';

const { UPDATE_ORGANIZATION_TITLE } = OrganizationsApiActions;

const dataSchema = {
  properties: {
    orgTitle: {
      title: 'Edit organization\'s title',
      type: 'string',
    },
  },
  title: '',
  type: 'object',
};

const uiSchema = {
  orgTitle: {
    classNames: 'column-span-12',
  },
};

const OrgTitleWrapper = styled.div`
  align-items: center;
  display: flex;
  margin: 20px 0 0 0;

  > button {
    margin-left: 16px;
  }
`;

const OrgTitleHeader = styled.h1`
  font-size: 28px;
  font-weight: normal;
  margin: 0;
  padding: 0;
`;

const FormMinusMargin = styled(Form)`
  flex: 1;
  margin: -30px;
`;

type Props = {
  actions :{
    resetRequestState :(actionType :string) => void;
    updateOrganizationTitle :RequestSequence;
  };
  isOwner :boolean;
  org :Map;
  requestStates :{
    UPDATE_ORGANIZATION_TITLE :RequestState;
  };
};

type State = {
  data :{
    orgTitle :string;
  };
  isEditing :boolean;
};

class OrgDescriptionSection extends Component<Props, State> {

  constructor(props :Props) {

    super(props);

    this.state = {
      data: {
        orgTitle: props.org.get('title', ''),
      },
      isEditing: false,
    };
  }

  componentDidUpdate(prevProps :Props) {

    const { requestStates } = this.props;

    if (requestStates[UPDATE_ORGANIZATION_TITLE] === RequestStates.SUCCESS
        && prevProps.requestStates[UPDATE_ORGANIZATION_TITLE] === RequestStates.PENDING) {
      this.resetState();
    }
  }

  resetState = () => {

    const { org } = this.props;

    this.setState({
      data: {
        orgTitle: org.get('title', ''),
      },
      isEditing: false,
    });
  }

  handleOnChange = ({ formData } :Object) => {

    this.setState({
      data: {
        orgTitle: formData.orgTitle || '',
      },
    });
  }

  handleOnClickEdit = () => {

    const { isOwner } = this.props;
    if (isOwner) this.setState({ isEditing: true });
  }

  handleOnClickSubmit = ({ formData } :Object) => {

    const { actions, isOwner, org } = this.props;
    const currentTitle :string = org.get('title');

    if (currentTitle === formData.orgTitle) {
      this.resetState();
    }
    else if (isOwner) {
      actions.updateOrganizationTitle({
        title: formData.orgTitle,
        organizationId: org.get('id'),
      });
    }
  }

  render() {

    const { isOwner, org, requestStates } = this.props;
    const { data, isEditing } = this.state;
    const title :string = org.get('title');

    if (isOwner && isEditing) {
      return (
        <FormMinusMargin
            formData={data}
            isSubmitting={requestStates[UPDATE_ORGANIZATION_TITLE] === RequestStates.PENDING}
            onChange={this.handleOnChange}
            onDiscard={this.resetState}
            onSubmit={this.handleOnClickSubmit}
            schema={dataSchema}
            uiSchema={uiSchema} />
      );
    }

    return (
      <OrgTitleWrapper>
        <OrgTitleHeader>{title}</OrgTitleHeader>
        {
          isOwner && (
            <EditButton onClick={this.handleOnClickEdit} />
          )
        }
      </OrgTitleWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  requestStates: {
    [UPDATE_ORGANIZATION_TITLE]: state.getIn(['orgs', UPDATE_ORGANIZATION_TITLE, 'requestState']),
  },
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    updateOrganizationTitle: OrganizationsApiActions.updateOrganizationTitle,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgDescriptionSection);
