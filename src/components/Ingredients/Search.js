import React, { useState, useEffect, useRef, useCallback } from 'react';

import Card from '../UI/Card';
import './Search.css';
import useHttp from '../../hooks/http';
import ErrorModal from '../UI/ErrorModal';
import LoadingIndicator from '../UI/LoadingIndicator';

const Search = React.memo(props => {
  const { onLoadIngredients } = props;
  const [enteredFilter, setEnteredFilter] = useState('');
  const { isLoading, error, sendRequest, reset } = useHttp();
  const inputRef = useRef();

  const onSearchSuccess = useCallback((responseData) => {
    const loadedIngredients = [];
    for(const key in responseData) {
      loadedIngredients.push({
        id: key,
        title: responseData[key].title,
        amount: responseData[key].amount
      });
    }
    onLoadIngredients(loadedIngredients);
  }, [onLoadIngredients]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if(enteredFilter === inputRef.current.value) {
        const query = enteredFilter.length === 0 ? '' : `?orderBy="title"&equalTo="${enteredFilter}"`;
        sendRequest(
          'https://react-hooks-a8c80.firebaseio.com/ingredients.json' + query,
          'GET',
          null,
          (responseData) => onSearchSuccess(responseData)
        );
      }
    }, 500);

    return () => {
      clearTimeout(timer);
    }
  }, [enteredFilter, inputRef, onSearchSuccess, sendRequest]);

  return (
    <section className="search">
      {error && <ErrorModal onClose={reset}>{error}</ErrorModal>}
      <Card>
        <div className="search-input">
          <label>Filter by Title</label>
          {isLoading && <LoadingIndicator />}
          <input
            ref={inputRef}
            type="text"
            value={enteredFilter}
            onChange={event => setEnteredFilter(event.target.value)}/>
        </div>
      </Card>
    </section>
  );
});

export default Search;
