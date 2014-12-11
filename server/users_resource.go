package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"github.com/gorilla/mux"
)

type User struct {
	Name     string `json:"name"`
	Password string `json:"-"`
	Head     string `json:"head"`
}

func init() {
	userStore = UsersEntry{Users: make([]*UserRef, 0), Parent: ""}
}

var userStore UsersEntry

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
	ret := make([]User, len(userStore.getUsers()))
	for i, ur := range userStore.getUsers() {
		ret[i] = User{Name: ur.Username, Password: ur.Password, Head: ur.RefHash}
	}
	return ret
}

func doesUsernameExist(username string) bool {
	nameExists := false
	for _, u := range userStore.getUsers() {
		if strings.ToLower(u.Username) == strings.ToLower(username) {
			nameExists = true
			break
		}
	}
	return nameExists
}

func getUser(username string) *UserRef {
	for _, u := range userStore.getUsers() {
		if strings.ToLower(u.Username) == strings.ToLower(username) {
			return u
		}
	}
	return nil
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

	nameTaken := doesUsernameExist(request.Username)

	if nameTaken {
		w.WriteHeader(http.StatusConflict)
		fmt.Fprintln(w, "Your username is already taken!")
		return
	}

	newUser := UserRef{
		Username: request.Username,
		Password: request.Password,
		RefHash:  "",
	}

	userStore.addUser(&newUser)

	fmt.Fprintf(w, "Creation of user '%s' succeeded\n", newUser.Username)
}

func getSingleUserRequest(w http.ResponseWriter, req *http.Request) {
	vars := mux.Vars(req)
	if usrName, ok := vars["username"]; ok {
		
		usr := getUser(usrName)
		answer := User{Name: usr.Username, Password: "", Head: usr.RefHash}
		jsonString, err := json.Marshal(answer)
		
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintln(w, "Marshal-Error")
			return
		}
		
		fmt.Fprintln(w, string(jsonString))
		
	} else {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "You must specify an username\n")
	}
}