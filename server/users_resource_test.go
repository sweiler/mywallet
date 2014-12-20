package main

import (
	"encoding/json"
	"net/http"
	"strings"
	"testing"
)

func FetchUsers(t *testing.T) []User {
	header := "{\"username\":\"admin\", \"password\":\"monsta\"}"

	req, err := http.NewRequest("GET", "http://localhost:5678/users", nil)
	if err != nil {
		t.Fatalf("Request building failed: %v", err)
	}
	req.Header.Add("X-Mywallet-Auth", header)
	resp, err := client.Do(req)

	if err != nil {
		t.Fatalf("HTTP error: %v", err)
	}

	if resp.StatusCode != 200 {
		t.Fatalf("HTTP-Status: %v", resp.StatusCode)
	}

	decoder := json.NewDecoder(resp.Body)

	var fetchedUsers []User
	err = decoder.Decode(&fetchedUsers)

	if err != nil {
		t.Errorf("Decoding error: %v", err)
	}
	return fetchedUsers
}

func FetchSingleUser(username string, password string, t *testing.T) User {

	req := buildGet("http://localhost:5678/users/"+username, username, password)

	resp, err := client.Do(req)

	if err != nil {
		t.Fatalf("HTTP error: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("HTTP status: %v", resp.StatusCode)
	}

	decoder := json.NewDecoder(resp.Body)

	var fetchedUser User
	err = decoder.Decode(&fetchedUser)
	if err != nil {
		t.Errorf("Decoding error: %v", err)
	}
	return fetchedUser
}

func TestSignUp(t *testing.T) {
	setUp()

	registerUser("admin", "monsta")

	fetchedUsers := FetchUsers(t)

	if len(fetchedUsers) != 1 {
		t.Errorf("There were %d users, but it should be exactly one", len(fetchedUsers))
	}

	if fetchedUsers[0].Name != "admin" {
		t.Errorf("The fetched username should be 'admin' but was '%s'", fetchedUsers[0].Name)
	}

	singleUser := FetchSingleUser("admin", "monsta", t)
	if singleUser.Name != "admin" {
		t.Errorf("The fetched username should be 'admin' but was '%s'", fetchedUsers[0].Name)
	}

	if singleUser.Head != "" {
		t.Errorf("The fetched HEAD rev should be '' but was '%s'", fetchedUsers[0].Head)
	}
	cleanUp()
}

func TestDuplicateUser(t *testing.T) {
	setUp()

	signUp := "{\"username\":\"admin\", \"password\":\"monsta\"}"
	resp, _ := http.Post("http://localhost:5678/users", "application/json", strings.NewReader(signUp))

	if resp.StatusCode != http.StatusOK {
		t.Errorf("The creation of the first user should have been successful, but error was %d", resp.StatusCode)
	}

	signUp = "{\"username\":\"Testuser2\", \"password\":\"pwd\"}"
	resp, _ = http.Post("http://localhost:5678/users", "application/json", strings.NewReader(signUp))

	if resp.StatusCode != http.StatusOK {
		t.Errorf("The creation of the second user should have been successful, but error was %d", resp.StatusCode)

	}

	signUp = "{\"username\":\"Testuser2\", \"password\":\"asdf\"}"
	resp, _ = http.Post("http://localhost:5678/users", "application/json", strings.NewReader(signUp))

	if resp.StatusCode != http.StatusConflict {
		t.Errorf("Status code of third request should have been 409, but was %d", resp.StatusCode)
	}

	fetchedUsers := FetchUsers(t)

	if len(fetchedUsers) != 2 {
		t.Errorf("There were %d users, but it should be exactly two", len(fetchedUsers))
	}
	cleanUp()
}
