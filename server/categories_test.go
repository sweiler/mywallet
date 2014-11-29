package main

import (
	"net/http"
	"strings"
	"testing"
)

func TestCreateCat(t *testing.T) {
	setUp()

	signUp := "{\"username\":\"Testuser\", \"password\":\"pwd\"}"

	http.Post("http://localhost:5678/users", "application/json", strings.NewReader(signUp))

	createCat := "{\"name\":\"Supercat\"}"
	http.Post("http://localhost:5678/users/Testuser/categories",
		"application/json", strings.NewReader(createCat))

	fetchedUsers := FetchUsers(t)

	if len(fetchedUsers) != 1 {
		t.Errorf("There were %d users, but it should be exactly one", len(fetchedUsers))
	}

	if fetchedUsers[0].Name != "Testuser" {
		t.Errorf("The fetched username should be 'Testuser' but was '%s'", fetchedUsers[0].Name)
	}

	if catLen := len(fetchedUsers[0].Categories); catLen != 1 {
		t.Errorf("There were %d categories, but there should exactly be one", catLen)
	}
}
