import React, { useReducer, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import Search from './Search';
import ErrorModal from '../UI/ErrorModal';
import useHttp from './../../hooks/http';

const ingredientReducer = (currentIngredients, action) => {
  switch(action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter(ingredient => ingredient.id !== action.id);
    default:
      throw new Error('Should not get there!');
  }
}

function Ingredients() {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const { isLoading, error, sendRequest, reset } = useHttp();

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    dispatch({type : 'SET', ingredients : filteredIngredients});
  }, []);

  const onRemoveIngredient = useCallback(ingredientId => {
    dispatch({type : 'DELETE', id : ingredientId});
  }, []);

  const onAddIngredient = useCallback((ingredient, responseData) => {
    dispatch({type : 'ADD', ingredient : { id: responseData.name, ...ingredient }});
  }, []);

  const addIngredientHandler = useCallback(ingredient => {
    sendRequest(
      'https://react-hooks-a8c80.firebaseio.com/ingredients.json',
      'POST',
      JSON.stringify({...ingredient}),
      (responseData) => onAddIngredient(ingredient, responseData)
    );
  }, [sendRequest, onAddIngredient]);

  const removeIngredientHandler = useCallback(id => {
    sendRequest(
      `https://react-hooks-a8c80.firebaseio.com/ingredients/${id}.json`,
      'DELETE',
      null,
      (responseData) => onRemoveIngredient(id)
    );
  }, [sendRequest, onRemoveIngredient]);

  const ingredientList = useMemo(() => {
    return (
      <IngredientList
        ingredients={userIngredients}
        onRemoveItem={removeIngredientHandler}
      />
    );
  }, [userIngredients, removeIngredientHandler]);

  return (
    <div className="App">
      {error && <ErrorModal onClose={reset}>{error}</ErrorModal>}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}/>

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler}/>
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
