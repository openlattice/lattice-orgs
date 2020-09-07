/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { faChevronRight } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Set } from 'immutable';
import { AppContentWrapper, Colors } from 'lattice-ui-kit';
import { LangUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';

import { CrumbLink, Header } from '../../components';
import { ENTITY_SETS, ORGANIZATIONS } from '../../core/redux/constants';
import { Routes } from '../../core/router';

const { NEUTRAL } = Colors;
const { isNonEmptyString } = LangUtils;

const Boxes = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 48px;

  > div {
    border: 1px solid ${NEUTRAL.N200};
    display: grid;
    grid-gap: 8px;
    margin-bottom: 48px;
    margin-right: 48px;
    max-width: 335px;
    padding: 24px 36px;
    width: 100%;

    > span {
      color: ${NEUTRAL.N500};
    }

    > b {
      font-size: 50px;
    }
  }
`;

const ManageLink = styled(CrumbLink)`
  align-items: center;
  font-size: 16px;

  > svg {
    font-size: 12px;
    margin-left: 8px;
    margin-top: 2px;
  }
`;

type Props = {
  organization :Organization;
  organizationId :UUID;
};

const OrgContainer = ({ organization, organizationId } :Props) => {

  const membersPath = Routes.ORG_MEMBERS.replace(Routes.ORG_ID_PARAM, organizationId);

  const entitySetIds :Set<UUID> = useSelector((s) => s.getIn([ORGANIZATIONS, ENTITY_SETS, organizationId]), Set());

  return (
    <AppContentWrapper padding="60px 30px 30px">
      <div>
        <Header as="h2">{organization.title}</Header>
      </div>
      {
        isNonEmptyString(organization.description) && (
          <div>{organization.description}</div>
        )
      }
      <Boxes>
        <div>
          <span>Members</span>
          <b>{organization.members.length}</b>
          <ManageLink to={membersPath}>
            <span>Manage Members</span>
            <FontAwesomeIcon fixedWidth icon={faChevronRight} size="sm" />
          </ManageLink>
        </div>
        <div>
          <span>Data Sets</span>
          <b>{entitySetIds.count()}</b>
          <ManageLink to="#">
            <span>Manage Data Sets</span>
            <FontAwesomeIcon fixedWidth icon={faChevronRight} size="sm" />
          </ManageLink>
        </div>
      </Boxes>
    </AppContentWrapper>
  );
};

export default OrgContainer;
