package tables

type Recipe struct {
	ID uint64 `gorm:"autoIncrement"`
	Name string `gorm:"unique;not null"`
	UniqueName string `gorm:"unique;not null"`
	Description string
	OvenTemp int
	EstimatedTime int
	Deleted bool
}

func (_ Recipe) StructName() string {
	return "Recipe"
}