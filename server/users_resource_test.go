package main

import (
	"encoding/json"
	"net/http"
	"strings"
	"testing"
)

var testServerStarted bool = false

func setUp() {
	if !testServerStarted {
		testServerStarted = true
		go main()
	}
	userStore = nil
}

func FetchUsers(t *testing.T) []User {
	resp, err := http.Get("http://localhost:5678/users")

	if err != nil {
		t.Fatalf("HTTP error: %v", err)
	}

	decoder := json.NewDecoder(resp.Body)

	var fetchedUsers []User
	err = decoder.Decode(&fetchedUsers)

	if err != nil {
		t.Errorf("Decoding error: %v", err)
	}
	return fetchedUsers
}

func TestEmptyUsers(t *testing.T) {
	setUp()

	fetchedUsers := FetchUsers(t)

	if len(fetchedUsers) != 0 {
		t.Errorf("There were %d users, but none should exist", len(fetchedUsers))
	}

}

func TestSignUp(t *testing.T) {
	setUp()

	signUp := "{\"username\":\"Testuser\", \"password\":\"pwd\"}"

	http.Post("http://localhost:5678/users", "application/json", strings.NewReader(signUp))

	fetchedUsers := FetchUsers(t)

	if len(fetchedUsers) != 1 {
		t.Errorf("There were %d users, but it should be exactly one", len(fetchedUsers))
	}

	if fetchedUsers[0].Name != "Testuser" {
		t.Errorf("The fetched username should be 'Testuser' but was '%s'", fetchedUsers[0].Name)
	}

	if fetchedUsers[0].Password != "" {
		t.Errorf("The fetched password should be '' but was '%s'", fetchedUsers[0].Password)
	}
}

func TestDuplicateUser(t *testing.T) {
	setUp()

	signUp := "{\"username\":\"Testuser\", \"password\":\"pwd\"}"
	http.Post("http://localhost:5678/users", "application/json", strings.NewReader(signUp))

	signUp = "{\"username\":\"Testuser2\", \"password\":\"pwd\"}"
	http.Post("http://localhost:5678/users", "application/json", strings.NewReader(signUp))

	signUp = "{\"username\":\"Testuser\", \"password\":\"asdf\"}"
	resp, _ := http.Post("http://localhost:5678/users", "application/json", strings.NewReader(signUp))

	if resp.StatusCode != http.StatusConflict {
		t.Errorf("Status code of second request should have been 409, but was %d", resp.StatusCode)
	}

	fetchedUsers := FetchUsers(t)

	if len(fetchedUsers) != 2 {
		t.Errorf("There were %d users, but it should be exactly two", len(fetchedUsers))
	}
}
