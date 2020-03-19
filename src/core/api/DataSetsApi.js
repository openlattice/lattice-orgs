/*
 * @flow
 */

import axios from 'axios';
import { AuthUtils } from 'lattice-auth';

import { Logger } from '../../utils';

const LOG = new Logger('DataSetsApi');

/**
 * `GET /entity-sets`
 *
 * Gets all EntitySet definitions.
 *
 * @static
 * @memberof lattice.EntitySetsApi
 * @param {UUID} organizationId
 * @return {Promise<EntitySet[]>} - a Promise that resolves the organization's data sets
 *
 * @example
 * EntitySetsApi.getDataSets();
 */
function getDataSets(organizationId :UUID) :Promise<*> {

  let baseUrl = '';
  const hostname :string = window.location.hostname;
  if (hostname === 'localhost') {
    baseUrl = 'http://localhost:8080';
  }
  else if (hostname.endsWith('openlattice.com')) {
    baseUrl = hostname.startsWith('staging') ? 'https://api.staging.openlattice.com' : 'https://api.openlattice.com';
  }

  const authToken = AuthUtils.getAuthToken();
  const axiosConfigObj :Object = {
    baseURL: `${baseUrl}/datastore/organization-database`,
    headers: {
      common: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      }
    }
  };

  return axios
    .create(axiosConfigObj)
    .get(`/${organizationId}/external-database-table`)
    .then((axiosResponse) => axiosResponse.data)
    .catch((error :Error) => {
      LOG.error(error);
      return Promise.reject(error);
    });
}

export {
  getDataSets,
};
