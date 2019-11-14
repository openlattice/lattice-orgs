import FileSaver from 'file-saver';

import DBMSTypes from './DBMSTypes';
import { TEMPLATE, TEMPLATE_CONSTANTS } from './IntegrationConfigTemplate';

const generateIntegrationConfigFile = ({
  orgId,
  orgName,
  orgPassword,
  orgUsername,
  targetDBMS,
  targetDatabase,
  targetPort,
  targetServer,
}) => {

  const {
    connection,
    connectionSuffix,
    driver,
    sqlStatement,
  } = DBMSTypes[targetDBMS];

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

  let template = TEMPLATE;
  Object.entries(fieldMappings).forEach(([field, value]) => {
    template = template.replace(new RegExp(field, 'g'), value);
  });

  const blob = new Blob([template], { type: 'text/yaml' });
  FileSaver.saveAs(blob, 'openlattice.yaml');
};

export {
  generateIntegrationConfigFile,
};
