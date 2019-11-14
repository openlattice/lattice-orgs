const TEMPLATE_CONSTANTS = {
  ORG_ID: '<orgId>',
  ORG_NAME: '<orgName>',
  ORG_NAME_CLEAN: '<orgNameClean>',
  ORG_PASSWORD: '<orgPassword>',
  ORG_USERNAME: '<orgUsername>',
  SQL_STATEMENT: '<sqlStatement>',
  TARGET_CONNECTION: '<targetConnection>',
  TARGET_CONNECTION_SUFFIX: '<targetConnectionSuffix>',
  TARGET_DATABASE: '<targetDatabase>',
  TARGET_PORT: '<targetPort>',
  TARGET_SERVER: '<targetServer>',
  TARGET_SQL_DRIVER: '<targetSQLDriver>',
};

/* eslint-disable max-len */
const TEMPLATE = `
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

export {
  TEMPLATE,
  TEMPLATE_CONSTANTS
};
