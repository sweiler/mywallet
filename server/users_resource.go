package main

import (
	"encoding/json"
	"fmt"
	"github.com/sweiler/eventstore"
	"log"
	"net/http"
	"strings"
)

type User struct {
	Name     string             `json:"name"`
	Channel  eventstore.Channel `json:"-"`
	Password string             `json:"-"`
}

var userStore []User

type userSignUp struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func getAllUsersRequest(w http.ResponseWriter, req *http.Request) {
	log.Println("All users requested")
	users := GetAllUsers()

	encoded, err := json.Marshal(users)
	if err != nil {

	}
	w.Write(encoded)
}

func GetAllUsers() []User {
	return userStore
}

func signUpRequest(w http.ResponseWriter, req *http.Request) {
	log.Println("A sign up is requested")
	decoder := json.NewDecoder(req.Body)

	var request userSignUp
	err := decoder.Decode(&request)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "An server side error occured: %v\n", err)
		return
	}

	if len(request.Username) == 0 {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintln(w, "Supplied username is empty")
		return
	}

	nameUnique := true
	for _, u := range userStore {
		if strings.ToLower(u.Name) == strings.ToLower(request.Username) {
			nameUnique = false
			break
		}
	}

	if !nameUnique {
		w.WriteHeader(http.StatusConflict)
		fmt.Fprintln(w, "Your username is already taken!")
		return
	}

	newUser := User{
		Name:     request.Username,
		Channel:  eventstore.NewTransientChannel(),
		Password: request.Password,
	}
	userStore = append(userStore, newUser)

	fmt.Fprintf(w, "Creation of user '%s' succeeded\n", newUser.Name)
}
