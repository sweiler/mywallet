package main

import (
	"crypto/sha1"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"io"
	"log"
	"math/rand"
	"net/http"
	"strings"
)

type User struct {
	Name string `json:"name"`
	Head string `json:"head"`
}

func init() {
	userStore = UsersEntry{Users: make([]*UserRef, 0), Parent: ""}
}

var userStore UsersEntry

type userSignUp struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

const chars string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

func getAllUsersRequest(w http.ResponseWriter, req *http.Request) {
	log.Println("All users requested")
	username, ok := auth(req)
	if ok == false {
		w.WriteHeader(403)
		fmt.Fprintln(w, "Login failed")
		return
	}
	if username != "admin" {
		w.WriteHeader(403)
		fmt.Fprintln(w, "You have no access to this resource")
		return
	}
	users := GetAllUsers()

	encoded, err := json.Marshal(users)
	if err != nil {

	}
	w.Write(encoded)
}

func GetAllUsers() []User {
	ret := make([]User, len(userStore.getUsers()))
	for i, ur := range userStore.getUsers() {
		ret[i] = User{Name: ur.Username, Head: ur.RefHash}
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

	salt := ""
	for i := 0; i < 16; i++ {
		idx := rand.Intn(len(chars))
		salt += chars[idx : idx+1]
	}

	hashing := salt + request.Password
	h := sha1.New()
	io.WriteString(h, hashing)

	newUser := UserRef{
		Username: request.Username,
		Password: string(h.Sum(nil)),
		Salt:     salt,
		RefHash:  "",
	}

	userStore.addUser(&newUser)

	fmt.Fprintf(w, "Creation of user '%s' succeeded\n", newUser.Username)
}

func getSingleUserRequest(w http.ResponseWriter, req *http.Request) {
	username, ok := auth(req)
	if !ok {
		w.WriteHeader(403)
		fmt.Fprintln(w, "You must authenticate to request your userdata.")
		return
	}
	vars := mux.Vars(req)
	if usrName, ok := vars["username"]; ok {
		if usrName != username && username != "admin" {
			w.WriteHeader(403)
			fmt.Fprintln(w, "You can only see your own profile")
			return
		}
		usr := getUser(usrName)
		answer := User{Name: usr.Username, Head: usr.RefHash}
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
