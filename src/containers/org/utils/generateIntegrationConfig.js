/*
 * @flow
 */

import FileSaver from 'file-saver';

import { DBMS_TYPES, TEMPLATE_CONSTANTS } from '../constants';

/* eslint-disable max-len */
const INTEGRATION_CONFIG_TEMPLATE = `
name: "${TEMPLATE_CONSTANTS.ORG_NAME}_initial_transfer"
description: "Copying over data from ${TEMPLATE_CONSTANTS.ORG_NAME} into OpenLattice server"
datasources:
- name: pdSQLDB
  url: "jdbc:${TEMPLATE_CONSTANTS.TARGET_CONNECTION}://${TEMPLATE_CONSTANTS.TARGET_SERVER}:${TEMPLATE_CONSTANTS.TARGET_PORT}/${TEMPLATE_CONSTANTS.TARGET_DATABASE}${TEMPLATE_CONSTANTS.TARGET_CONNECTION_SUFFIX}"
  username: "<INSERT_USERNAME_HERE>"
  password: "<INSERT_PASSWORD_HERE>"
  driver: ${TEMPLATE_CONSTANTS.TARGET_SQL_DRIVER}
  fetchSize: 20000
destinations:
- name: openLatticeDB
  url: "jdbc:postgresql://atlas.openlattice.com:30001/${TEMPLATE_CONSTANTS.ORG_ID}?ssl=true&sslmode=require"
  driver: org.postgresql.Driver
  username: "${TEMPLATE_CONSTANTS.ORG_USERNAME}"
  password: "${TEMPLATE_CONSTANTS.ORG_PASSWORD}"
integrations:
  pdSQLDB:
    openLatticeDB:
      - source: " ( ${TEMPLATE_CONSTANTS.SQL_STATEMENT} ) dh "
        destination: ${TEMPLATE_CONSTANTS.ORG_NAME_CLEAN}_data_Tables
        description: "${TEMPLATE_CONSTANTS.ORG_NAME_CLEAN} table listing"
      - source: "select '( select * from ' || \\"TABLE_NAME\\" || ' ) ' || 'tbl_' || \\"TABLE_NAME\\" as query, \\"TABLE_NAME\\" as destination, 'gluttony'  as description from ${TEMPLATE_CONSTANTS.ORG_NAME_CLEAN}_data_Tables;"
        destination: "dst"
        description: "gluttony"
        gluttony: true
`;
/* eslint-enable */

type Props = {
  orgId :string;
  orgName :string;
  orgPassword :string;
  orgUsername :string;
  targetDatabase :string;
  targetPort :number;
  targetServer :string;
  targetDBMS :string;
};

export default function generateIntegrationConfigFile({
  orgId,
  orgName,
  orgPassword,
  orgUsername,
  targetDBMS,
  targetDatabase,
  targetPort,
  targetServer,
} :Props) {

  const {
    connection,
    connectionSuffix,
    driver,
    sqlStatement,
  } = DBMS_TYPES[targetDBMS];

  const orgIdClean = `org_${orgId.replace(/-/g, '')}`;
  const orgNameClean = orgName.replace(/[^a-zA-Z0-9]/g, '');

  const fieldMappings = {
    [TEMPLATE_CONSTANTS.ORG_ID]: orgIdClean,
    [TEMPLATE_CONSTANTS.ORG_NAME]: orgName,
    [TEMPLATE_CONSTANTS.ORG_NAME_CLEAN]: orgNameClean,
    [TEMPLATE_CONSTANTS.ORG_PASSWORD]: orgPassword,
    [TEMPLATE_CONSTANTS.ORG_USERNAME]: orgUsername,
    [TEMPLATE_CONSTANTS.SQL_STATEMENT]: sqlStatement,
    [TEMPLATE_CONSTANTS.TARGET_CONNECTION]: connection,
    [TEMPLATE_CONSTANTS.TARGET_CONNECTION_SUFFIX]: connectionSuffix,
    [TEMPLATE_CONSTANTS.TARGET_DATABASE]: targetDatabase,
    [TEMPLATE_CONSTANTS.TARGET_PORT]: targetPort,
    [TEMPLATE_CONSTANTS.TARGET_SERVER]: targetServer,
    [TEMPLATE_CONSTANTS.TARGET_SQL_DRIVER]: driver,
  };

  let template = INTEGRATION_CONFIG_TEMPLATE;
  Object.entries(fieldMappings).forEach(([field, value]) => {
    template = template.replace(new RegExp(field, 'g'), (value :any));
  });

  const blob = new Blob([template], { type: 'text/yaml' });
  FileSaver.saveAs(blob, 'openlattice.yaml');
}
