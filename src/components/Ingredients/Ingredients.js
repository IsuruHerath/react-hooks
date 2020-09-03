import React, { useReducer, useCallback } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import Search from './Search';
import ErrorModal from '../UI/ErrorModal';

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

const httpReducer = (currentHttpState, action) => {
  switch(action.type) {
    case 'SEND':
      return {loading: true, error: null};
    case 'RESPONSE':
      return { ...currentHttpState, loading: false};
    case 'ERROR':
      return { loading: false, error: action.error};
    default:
      throw new Error('Should not get there!');
  }
}

function Ingredients() {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {loading: true, error : null});
  // const [ingredients, setIngredients] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState();

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    dispatchHttp({type: 'RESPONSE'});
    // setIsLoading(false);
    dispatch({type : 'SET', ingredients : filteredIngredients});
    //setIngredients(filteredIngredients);
  }, []);

  const addIngredientHandler = ingredient => {
    dispatchHttp({type: 'SEND'});
    // setIsLoading(true);
    fetch('https://react-hooks-a8c80.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify({...ingredient}),
      headers: { 'Content-Type': 'application/json'}
    }).then(response => {
      dispatchHttp({type: 'RESPONSE'});
      // setIsLoading(false);
      return response.json();
    }).then(responseData => {
      dispatch({type : 'ADD', ingredient : { id: responseData.name, ...ingredient }});
      // setIngredients(prevIngredients => [
      //   ...prevIngredients,
      //   { id: responseData.name, ...ingredient }
      // ]);
    });
  };

  const removeIngredient = id => {
    dispatchHttp({type: 'SEND'});
    // setIsLoading(true);
    fetch(`https://react-hooks-a8c80.firebaseio.com/ingredients/${id}.json`, {
      method: 'DELETE'
    }).then(response => {
      dispatchHttp({type: 'RESPONSE'});
      // setIsLoading(false);
      dispatch({type : 'DELETE', id : id});
      // setIngredients(prevIngredients => 
      //   prevIngredients.filter(ingredient => ingredient.id !== id)
      // );
    }).catch(error => {
      dispatchHttp({type: 'ERROR', error: 'Something went wrong.'});
      // setIsLoading(false);
      // setError("Something went wrong.");
    });
  }

  const clearError = () => {
    dispatchHttp({type: 'ERROR', error: null});
    // setError();
  }

  return (
    <div className="App">
      {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}/>

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler}/>
        <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredient}/>
      </section>
    </div>
  );
}

export default Ingredients;
