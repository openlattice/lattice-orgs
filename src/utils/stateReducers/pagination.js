// @flow

type State = {|
  page :number;
  query :string;
  start :number;
|};

type Action = {
  page ?:number;
  query ?:string;
  start ?:number;
  type :string;
};

const INITIAL_PAGINATION_STATE :State = {
  page: 1,
  query: '',
  start: 0,
};

const paginationReducer = (state :State, action :Action) => {
  switch (action.type) {
    case 'page': {
      return {
        ...state,
        page: action.page || INITIAL_PAGINATION_STATE.page,
        start: action.start || INITIAL_PAGINATION_STATE.start,
      };
    }
    case 'filter': {
      return {
        ...INITIAL_PAGINATION_STATE,
        query: action.query || INITIAL_PAGINATION_STATE.query,
      };
    }
    case 'reset':
      return INITIAL_PAGINATION_STATE;
    default:
      return state;
  }
};

export {
  INITIAL_PAGINATION_STATE,
  paginationReducer
};
