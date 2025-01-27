package queries

import (
	"github.com/ericlp/tasteit/backend/internal/db/tables"
	"github.com/georgysavva/scany/pgxscan"
	"github.com/google/uuid"
)

var getImageForRecipeBookQuery = `
SELECT image_id, recipe_book_id 
FROM recipe_book_image
WHERE recipe_book_id=$1
`

func GetImageForRecipeBook(recipeBookId uuid.UUID) (*tables.Image, error) {
	db := getDb()

	var recipeBookImage tables.RecipeBookImage
	err := pgxscan.Get(ctx, db, &recipeBookImage, getImageForRecipeBookQuery, recipeBookId)

	if err != nil {
		return nil, err
	}

	img, err := GetImageById(recipeBookImage.ImageId)
	return img, err
}

var getImagesForRecipeBookQuery = `
SELECT image_id, recipe_book_id
FROM recipe_book_image
WHERE recipe_book_id=$1
`

func GetImagesForRecipeBook(recipeBookId uuid.UUID) ([]tables.Image, error) {
	db := getDb()

	var recipeBookImages []*tables.RecipeBookImage
	err := pgxscan.Select(ctx, db, &recipeBookImages, getImagesForRecipeBookQuery, recipeBookId)
	if err != nil {
		return nil, err
	}

	var images []tables.Image
	if recipeBookImages != nil {
		for _, bookImage := range recipeBookImages {
			img, err := GetImageById(bookImage.ImageId)
			if err != nil {
				return nil, err
			}
			images = append(images, *img)
		}
	}

	return images, nil
}
