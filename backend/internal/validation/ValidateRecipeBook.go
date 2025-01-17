package validation

import (
	"errors"
	"github.com/ericlp/tasteit/backend/internal/db/queries"
	"github.com/ericlp/tasteit/backend/internal/models"
	"github.com/google/uuid"
	"log"
)

var (
	ErrFailedToRetrieveImage  = errors.New("failed to retrieve the provided image id from the database")
	ErrFailedToRetrieveRecipe = errors.New("failed to retrieve the provided recipe id from the database")
)

func ValidateRecipeBook(recipeBook *models.EditRecipeBookJson) error {
	err := validateRecipeBookImages(recipeBook.Images)
	if err != nil {
		return err
	}

	err = validateRecipeBookRecipes(recipeBook.Recipes)
	if err != nil {
		return err
	}

	return nil
}

func validateRecipeBookImages(images []uuid.UUID) error {
	for _, imageId := range images {
		_, err := queries.GetImageById(imageId)
		if err != nil {
			log.Printf("Failed to retrieve image: %v\n", err)
			return ErrFailedToRetrieveImage
		}
	}
	return nil
}

func validateRecipeBookRecipes(recipes []uuid.UUID) error {
	for _, recipeId := range recipes {
		_, err := queries.GetRecipeById(recipeId)
		if err != nil {
			log.Printf("Failed to retrieve recipe: %v\n", err)
			return ErrFailedToRetrieveRecipe
		}
	}
	return nil
}
