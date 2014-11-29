package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/sweiler/eventstore"
	"log"
	"net/http"
	"strings"
)

type User struct {
	Name       string             `json:"name"`
	Channel    eventstore.Channel `json:"-"`
	Password   string             `json:"-"`
	Categories []Category         `json:"categories"`
}

func (this *User) createEvent() eventstore.Event {
	buf := new(bytes.Buffer)
	encoder := json.NewEncoder(buf)
	encoder.Encode(this)
	return eventstore.Event{"create user", buf.String()}
}

func newUserFromEvent(event eventstore.Event) (*User, error) {
	if event.EventType == "create user" {
		dataReader := strings.NewReader(event.Data)
		decoder := json.NewDecoder(dataReader)
		usr := new(User)
		err := decoder.Decode(usr)
		return usr, err
	} else {
		return nil, errors.New("The event has the wrong type!")
	}
}

var userStore []*User
var usersChannel eventstore.Channel

func init() {
	usersChannel = eventstore.GetChannel("_users")
	usersChannel.AttachListener(onUserEvent)
}

type userSignUp struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func onUserEvent(event eventstore.Event) {
	if event.EventType == "create user" {
		user, _ := newUserFromEvent(event)
		log.Println("A user event has arrived")
		if !doesUsernameExist(user.Name) {
			userStore = append(userStore, user)
		}
	}
}

func getAllUsersRequest(w http.ResponseWriter, req *http.Request) {
	log.Println("All users requested")
	users := GetAllUsers()

	encoded, err := json.Marshal(users)
	if err != nil {

	}
	w.Write(encoded)
}

func GetAllUsers() []*User {
	return userStore
}

func doesUsernameExist(username string) bool {
	nameExists := false
	for _, u := range userStore {
		if strings.ToLower(u.Name) == strings.ToLower(username) {
			nameExists = true
			break
		}
	}
	return nameExists
}

func getUser(username string) *User {
	for _, u := range userStore {
		if strings.ToLower(u.Name) == strings.ToLower(username) {
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

	channel, err := eventstore.NewChannel(request.Username)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintln(w, "Your username is already taken!")
		return
	}

	newUser := User{
		Name:       request.Username,
		Channel:    channel,
		Password:   request.Password,
		Categories: make([]Category, 0),
	}
	usersChannel.PushEvent(newUser.createEvent())

	fmt.Fprintf(w, "Creation of user '%s' succeeded\n", newUser.Name)
}
