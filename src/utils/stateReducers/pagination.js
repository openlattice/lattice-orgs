// @flow
const FILTER = 'filter';
const PAGE = 'page';
const RESET = 'reset';

type State = {|
  page :number;
  query :string;
  start :number;
|};

type Action = {|
  page ?:number;
  query ?:string;
  start ?:number;
  type :'filter' | 'page' | 'reset';
|};

const INITIAL_PAGINATION_STATE :State = {
  page: 1,
  query: '',
  start: 0,
};

const paginationReducer = (state :State, action :Action) => {
  switch (action.type) {
    case PAGE: {
      return {
        ...state,
        page: action.page || INITIAL_PAGINATION_STATE.page,
        start: action.start || INITIAL_PAGINATION_STATE.start,
      };
    }
    case FILTER: {
      return {
        ...INITIAL_PAGINATION_STATE,
        query: action.query || INITIAL_PAGINATION_STATE.query,
      };
    }
    case RESET:
      return INITIAL_PAGINATION_STATE;
    default:
      return state;
  }
};

export {
  FILTER,
  INITIAL_PAGINATION_STATE,
  PAGE,
  RESET,
  paginationReducer,
};
