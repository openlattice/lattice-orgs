/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Form } from 'lattice-fabricate';
import { OrganizationsApiActions } from 'lattice-sagas';
import { Colors, EditButton } from 'lattice-ui-kit';
import { LangUtils } from 'lattice-utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as ReduxActions from '../../../core/redux/ReduxActions';

const { NEUTRALS } = Colors;
const { UPDATE_ORGANIZATION_DESCRIPTION } = OrganizationsApiActions;
const { isNonEmptyString } = LangUtils;

const EditButtonAligned = styled(EditButton)`
  align-self: flex-start;
`;

const dataSchema = {
  properties: {
    description: {
      title: 'Edit organization\'s description',
      type: 'string',
    },
  },
  title: '',
  type: 'object',
};

const uiSchema = {
  description: {
    classNames: 'column-span-12',
    'ui:widget': 'textarea',
  },
};

const OrgDescriptionHeader = styled.h3`
  font-size: 20px;
  font-weight: normal;
  margin: 0;
  padding: 0;
`;

const NoDescription = styled.i`
  color: ${NEUTRALS[1]};
  font-size: 16px;
  font-weight: normal;
`;

type Props = {
  actions :{
    resetRequestState :(actionType :string) => void;
    updateOrganizationDescription :RequestSequence;
  };
  isOwner :boolean;
  org :Map;
  requestStates :{
    UPDATE_ORGANIZATION_DESCRIPTION :RequestState;
  };
};

type State = {
  data :{
    description :string;
  };
  isEditing :boolean;
};

class OrgDescriptionSection extends Component<Props, State> {

  constructor(props :Props) {

    super(props);

    this.state = {
      data: {
        description: props.org.get('description', ''),
      },
      isEditing: false,
    };
  }

  componentDidUpdate(prevProps :Props) {

    const { requestStates } = this.props;

    if (requestStates[UPDATE_ORGANIZATION_DESCRIPTION] === RequestStates.SUCCESS
        && prevProps.requestStates[UPDATE_ORGANIZATION_DESCRIPTION] === RequestStates.PENDING) {
      this.resetState();
    }
  }

  resetState = () => {

    const { org } = this.props;

    this.setState({
      data: {
        description: org.get('description', ''),
      },
      isEditing: false,
    });
  }

  handleOnChange = ({ formData } :Object) => {

    this.setState({
      data: {
        description: formData.description || '',
      },
    });
  }

  handleOnClickEdit = () => {

    const { isOwner } = this.props;
    if (isOwner) this.setState({ isEditing: true });
  }

  handleOnClickSubmit = ({ formData } :Object) => {

    const { actions, isOwner, org } = this.props;
    if (isOwner) {
      actions.updateOrganizationDescription({
        description: formData.description,
        organizationId: org.get('id'),
      });
    }
  }

  render() {

    const { isOwner, org, requestStates } = this.props;
    const { data, isEditing } = this.state;
    const description :string = org.get('description', '');

    if (isOwner && isEditing) {
      return (
        <Form
            formData={data}
            isSubmitting={requestStates[UPDATE_ORGANIZATION_DESCRIPTION] === RequestStates.PENDING}
            noPadding
            onChange={this.handleOnChange}
            onDiscard={this.resetState}
            onSubmit={this.handleOnClickSubmit}
            schema={dataSchema}
            uiSchema={uiSchema} />
      );
    }

    if (isOwner) {
      return (
        <>
          {
            isNonEmptyString(description)
              ? <OrgDescriptionHeader>{description}</OrgDescriptionHeader>
              : <NoDescription>No description</NoDescription>
          }
          <EditButtonAligned onClick={this.handleOnClickEdit} />
        </>
      );
    }

    return (
      <OrgDescriptionHeader>{description}</OrgDescriptionHeader>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  requestStates: {
    [UPDATE_ORGANIZATION_DESCRIPTION]: state.getIn(['orgs', UPDATE_ORGANIZATION_DESCRIPTION, 'requestState']),
  },
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    updateOrganizationDescription: OrganizationsApiActions.updateOrganizationDescription,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgDescriptionSection);
