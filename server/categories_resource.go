package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/sweiler/eventstore"
	"net/http"
)

type Category struct {
	Name string `json:"name"`
	User string `json:"user"`
}

type createCategoryRequest struct {
	Name string `json:"name"`
}

func (this *Category) createEvent() eventstore.Event {
	buf := new(bytes.Buffer)
	encoder := json.NewEncoder(buf)
	encoder.Encode(this)
	return eventstore.Event{"create category", buf.String()}
}

func getCategoriesRequest(w http.ResponseWriter, req *http.Request) {
	params := mux.Vars(req)
	userid := params["user"]

	channelExists := eventstore.ChannelExists(userid)

	if !channelExists {
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprintf(w, "User with id '%s' does not exist.\n", userid)
		return
	}

	usr := getUser(userid)
	encoder := json.NewEncoder(w)
	encoder.Encode(usr.Categories)

}

func postCategoryRequest(w http.ResponseWriter, req *http.Request) {
	params := mux.Vars(req)
	userid := params["user"]

	var newCatReq createCategoryRequest
	decoder := json.NewDecoder(req.Body)
	err := decoder.Decode(&newCatReq)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "Your request was malformed: %v\n", err)
		return
	}

	usr := getUser(userid)
	if usr == nil {
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprintf(w, "A user with id '%s' was not found!\n", userid)
		return
	}
	createdCat := Category{Name: newCatReq.Name, User: usr.Name}
	w.WriteHeader(http.StatusCreated)
	fmt.Fprintf(w, "Category created: %v\n", createdCat)
	usr.Categories = append(usr.Categories, createdCat)

}
