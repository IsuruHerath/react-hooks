import React, { useState, useCallback } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import Search from './Search';
import ErrorModal from '../UI/ErrorModal';

function Ingredients() {
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState();

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    setIsLoading(false);
    setIngredients(filteredIngredients);
  }, []);

  const addIngredientHandler = ingredient => {
    setIsLoading(true);
    fetch('https://react-hooks-a8c80.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify({...ingredient}),
      headers: { 'Content-Type': 'application/json'}
    }).then(response => {
      setIsLoading(false);
      return response.json();
    }).then(responseData => {
      setIngredients(prevIngredients => [
        ...prevIngredients,
        { id: responseData.name, ...ingredient }
      ]);
    });
  };

  const removeIngredient = id => {
    setIsLoading(true);
    fetch(`https://react-hooks-a8c80.firebaseio.com/ingredients/${id}.json`, {
      method: 'DELETE'
    }).then(response => {
      setIsLoading(false);
      setIngredients(prevIngredients => 
        prevIngredients.filter(ingredient => ingredient.id !== id)
      );
    }).catch(error => {
      setIsLoading(false);
      setError("Something went wrong.");
    });
  }

  const clearError = () => {
    setError();
  }

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}/>

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler}/>
        <IngredientList ingredients={ingredients} onRemoveItem={removeIngredient}/>
      </section>
    </div>
  );
}

export default Ingredients;
