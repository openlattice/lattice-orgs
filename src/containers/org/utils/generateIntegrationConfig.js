/*
 * @flow
 */

import FileSaver from 'file-saver';

import { DBMS_TYPES, TEMPLATE_CONSTANTS } from '../constants';

/* eslint-disable max-len */
const INTEGRATION_CONFIG_TEMPLATE = `
name: "${TEMPLATE_CONSTANTS.ORG_NAME}_initial_transfer"
description: "Copying over data from ${TEMPLATE_CONSTANTS.ORG_NAME} into OpenLattice server"
datalakes:
- name: "pdSQLDB"
  url: "jdbc:${TEMPLATE_CONSTANTS.TARGET_CONNECTION}://${TEMPLATE_CONSTANTS.TARGET_SERVER}:${TEMPLATE_CONSTANTS.TARGET_PORT}/${TEMPLATE_CONSTANTS.TARGET_DATABASE}${TEMPLATE_CONSTANTS.TARGET_CONNECTION_SUFFIX}"
  driver: ${TEMPLATE_CONSTANTS.TARGET_SQL_DRIVER}
  dataFormat: ${TEMPLATE_CONSTANTS.TARGET_SQL_DRIVER}
  username: "<INSERT_USERNAME_HERE>"
  password: "<INSERT_PASSWORD_HERE>"
- name: "openLatticeDB"
  url: "jdbc:postgresql://atlas.openlattice.com:30001/${TEMPLATE_CONSTANTS.ORG_ID}?ssl=true&sslmode=require"
  driver: "org.postgresql.Driver"
  dataFormat: "org.postgresql.Driver"
  username: "${TEMPLATE_CONSTANTS.ORG_USERNAME}"
  password: "${TEMPLATE_CONSTANTS.ORG_PASSWORD}"
integrations:
  pdSQLDB:
    openLatticeDB:
    - source: "SELECT * FROM data LIMIT 10"
      destination: ${TEMPLATE_CONSTANTS.ORG_NAME_CLEAN}_data_table
      description: "${TEMPLATE_CONSTANTS.ORG_NAME_CLEAN} table listing"
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
