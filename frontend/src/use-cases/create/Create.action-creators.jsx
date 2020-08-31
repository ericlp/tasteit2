import {
    ON_RECIPE_SAVE_AWAIT_RESPONSE,
    ON_RECIPE_SAVE_FAILED,
    ON_RECIPE_SAVE_SUCCESSFUL,
    ON_RECIPE_VALIDATION_FAILED
} from "./Create.actions";
import {postNewRecipe} from "../../api/post.NewRecipe.api";
import {handleError} from "../../common/functions/handleError";

export function onRecipeSave(recipe) {
    const errors = validateNewRecipe(recipe)

    if (Object.keys(errors).length === 0) {
        return dispatch => {
            dispatch({type: ON_RECIPE_SAVE_AWAIT_RESPONSE, error: false})
            postNewRecipe(recipe)
                .then(response => {
                    console.log("RESP", response)
                    dispatch(onRecipeSaveSuccessful(response));
                })
                .catch(error => {
                    console.log("ERREOAR", error)
                    dispatch(onRecipeSaveFailed(error));
                });
        };
    }

    return {
        type: ON_RECIPE_VALIDATION_FAILED,
        payload: {
            errors: errors
        },
        error: false
    }
}

function onRecipeSaveSuccessful(response) {
    return {
        type: ON_RECIPE_SAVE_SUCCESSFUL,
        payload: {
            recipe: response.data.data.recipeUniqueName
        },
        error: false
    }
}

function onRecipeSaveFailed(error) {
    return handleError(error, ON_RECIPE_SAVE_FAILED, "Kunde inte spara recept, försök igen senare.");
}


function validateIngredients(state) {
    let ingredients = {}

    state.ingredients.forEach(ingredient => {
        let ingredientObj = {}
        if (ingredient.name.length <= 0) {
            ingredientObj["name"] = "Ej tom!"
        }
        if (ingredient.unit.length <= 0) {
            ingredientObj["unit"] = "Ej tom!"
        }
        if (ingredient.amount === undefined || ingredient.amount.length <= 0) {
            ingredientObj["amount"] = "Ej tom!"
        }

        if (Object.keys(ingredientObj).length > 0) {
            ingredients[ingredient.id] = ingredientObj
        }
    });

    return Object.keys(ingredients).length > 0 ?
        ingredients :
        null;
}

function validateSteps(state) {
    let steps = {}

    state.steps.forEach(step => {
        let stepObj = {}
        if (step.step.length <= 0) {
            stepObj["name"] = "Ej tom!"
        }

        if (Object.keys(stepObj).length > 0) {
            steps[step.id] = stepObj
        }
    });

    return Object.keys(steps).length > 0 ?
        steps :
        null;
}

function validateNewRecipe(state) {
    let errors = {}

    if (state.recipeName.length <= 0) {
        errors = {
            ...errors,
            name: "Receptet måste ha ett namn!"
        }
    }

    let ingredients = validateIngredients(state)
    if (ingredients !== null) {
        errors = {
            ...errors,
            ingredients: ingredients
        }
    }

    let steps = validateSteps(state)
    if (steps !== null) {
        errors = {
            ...errors,
            steps: steps
        }
    }

    return errors
}