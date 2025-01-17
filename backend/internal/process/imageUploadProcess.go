package process

import (
	"encoding/base64"
	"fmt"
	"github.com/ericlp/tasteit/backend/internal/common"
	"github.com/ericlp/tasteit/backend/internal/db/commands"
	"github.com/ericlp/tasteit/backend/internal/models"
	"github.com/ericlp/tasteit/backend/internal/validation"
	"os"
)

func UploadImage(file *validation.File) (*models.ImageJson, error) {
	fileName := generateImageName(file.Name)
	filenameWithPath := fmt.Sprintf("%s%s", fileName, file.FileType)

	id, err := commands.CreateImage(filenameWithPath)
	if err != nil {
		return nil, err
	}

	uniqueFilename := fmt.Sprintf("%s_%s", id, filenameWithPath)
	folder := common.GetEnvVars().ImageFolder
	path := fmt.Sprintf("%s/%s", folder, uniqueFilename)
	newFile, err := os.Create(path)
	if err != nil {
		return nil, err
	}

	_, err = newFile.Write(file.Data)
	if err != nil {
		return nil, err
	}

	return &models.ImageJson{
		Path: uniqueFilename,
		ID:   id,
	}, err
}

func generateImageName(name string) string {
	return base64.URLEncoding.EncodeToString([]byte(name))
}
