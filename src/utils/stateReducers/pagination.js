const INITIAL_PAGINATION_STATE = {
  page: 1,
  start: 0,
  query: ''
};

const paginationReducer = (state, action) => {
  switch (action.type) {
    case 'page': {
      return {
        ...state,
        page: action.page,
        start: action.start,
      };
    }
    case 'filter': {
      return {
        page: 1,
        query: action.query,
        start: 0,
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
