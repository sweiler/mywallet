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
