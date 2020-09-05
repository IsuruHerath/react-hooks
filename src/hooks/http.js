import { useReducer, useCallback } from 'react';

const httpReducer = (currentHttpState, action) => {
    switch(action.type) {
        case 'SEND':
            return {loading: true, error: null};
        case 'RESPONSE':
            return { ...currentHttpState, loading: false};
        case 'ERROR':
            return { loading: false, error: action.error};
        case 'CLEAR':
            return { loading: false, error : null };
        default:
            throw new Error('Should not get there!');
    }
}

const useHttp = () => {
    const [httpState, dispatchHttp] = useReducer(httpReducer, {loading: false, error : null});

    const reset = () => dispatchHttp({type: 'CLEAR'});

    const sendRequest = useCallback((url, method, body, onSuccess) => {
        dispatchHttp({type: 'SEND'});
        fetch(url, {
            method: method,
            body: body,
            headers: { 'Content-Type': 'application/json'}
        }).then(response => {
            return response.json();
        }).then(responseData => {
            dispatchHttp({type: 'RESPONSE'});
            if(onSuccess) onSuccess(responseData);
        }).catch(error => {
            dispatchHttp({ type: 'ERROR', error: 'Something went wrong!' });
        });
    }, []);

    return {
        isLoading: httpState.loading,
        error: httpState.error,
        sendRequest: sendRequest,
        reset: reset
    };
};

export default useHttp;