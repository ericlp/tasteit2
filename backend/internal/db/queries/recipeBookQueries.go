package queries

import (
	"github.com/ericlp/tasteit/backend/internal/db/tables"
	"github.com/georgysavva/scany/pgxscan"
	"github.com/google/uuid"
)

var getRecipeBookByNameQuery = `
SELECT id, name, unique_name, author, owned_by, deleted
FROM recipe_book
WHERE unique_name=$1
`

func GetRecipeBookByName(uniqueName string) (*tables.RecipeBook, error) {
	db := getDb()

	var recipeBook tables.RecipeBook
	err := pgxscan.Get(ctx, db, &recipeBook, getRecipeBookByNameQuery, uniqueName)
	return &recipeBook, err
}

var getNonDeletedBooksQuery = `
SELECT id, name, unique_name, author, owned_by, deleted
FROM recipe_book
WHERE deleted=false
`

func GetNonDeletedRecipeBooks() ([]*tables.RecipeBook, error) {
	db := getDb()

	var recipeBooks []*tables.RecipeBook
	err := pgxscan.Select(ctx, db, &recipeBooks, getNonDeletedBooksQuery)

	return recipeBooks, err
}

var getRecipeBookByIdQuery = `
SELECT id, name, unique_name, author, owned_by, deleted
FROM recipe_book
WHERE id=$1
`

func GetRecipeBookById(id uuid.UUID) (*tables.RecipeBook, error) {
	db := getDb()

	var recipeBook tables.RecipeBook
	err := pgxscan.Get(ctx, db, &recipeBook, getRecipeBookByIdQuery, id)
	return &recipeBook, err
}
