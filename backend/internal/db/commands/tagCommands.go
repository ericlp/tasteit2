package commands

import (
	"github.com/georgysavva/scany/pgxscan"
	"github.com/google/uuid"
	"github.com/viddem/vrecipes/backend/internal/db/tables"
)

var createTagCommand = `
INSERT INTO tag(name, description, color_red, color_green, color_blue, created_by, deleted)
		 VALUES($1,   $2,		   $3, 		  $4, 		   $5, 		   $6,         false)
RETURNING id, description, color_red, color_green, color_blue, created_by
`

func CreateTag(name, description string, colorRed, colorGreen, colorBlue uint8, createdBy uuid.UUID) (*tables.Tag, error) {
	db := getDb()

	var tag tables.Tag
	err := pgxscan.Get(ctx, db, &tag, createTagCommand, name, description, colorRed, colorGreen, colorBlue, createdBy)
	return &tag, err
}

var tagSetDeletedCommand = `
UPDATE tag
SET deleted=true,
	name=$1
WHERE id=$2
`

func TagSetDeleted(name string, id uuid.UUID) error {
	db := getDb()

	_, err := db.Exec(ctx, tagSetDeletedCommand, name, id)
	return err
}
