package main

import (
	"net/http"
	"github.com/gorilla/mux"
	"fmt"
	"github.com/sweiler/mywallet/server/filemanager"
	"io/ioutil"
	"encoding/json"
)

type PostResponse struct {
	Hash string `json:"hash"`
}

type UserObject struct {
	Data interface{} `json:"data"`
	Ref string `json:"ref"`
}

func postUserObject(w http.ResponseWriter, req *http.Request) {
	vars := mux.Vars(req)
	if username, ok := vars["username"]; ok {
		obj, err := ioutil.ReadAll(req.Body)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprintln(w, "Error occured during request processing")
			return
		}
		
		objStruct := new(UserObject)
		err = json.Unmarshal(obj, objStruct)
		if err != nil || objStruct.Data == nil {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprintln(w, "The object is malformed." +
				" It must be a json-document with a data part and a ref string")
			return
		}
		
		usr := getUser(username)
		head := usr.RefHash
		if objStruct.Ref != head {
			w.WriteHeader(http.StatusConflict)
			fmt.Fprintln(w, "The HEAD is moved forward. Please pull the newest changes first.")
			return
		}
		
		hash := filemanager.CreateObject(username, string(obj))
		
		usr.RefHash = hash
		userStore.save()
		
		resp := PostResponse{Hash: hash}
		
		encoder := json.NewEncoder(w)
		encoder.Encode(resp)
		
		return
	}
	
	w.WriteHeader(http.StatusBadRequest)
	fmt.Fprintln(w, "You must specifiy a user and a object id")
}

func getUsersObject(w http.ResponseWriter, req *http.Request) {
	vars := mux.Vars(req)
	if username, ok := vars["username"]; ok {
		if objectId, ok := vars["object"]; ok {
			
			jsonStr, err := filemanager.RetrieveObject(username, objectId)
			if err != nil {
				if err.Error() == "File content has changed" {
					w.WriteHeader(http.StatusInternalServerError)
					fmt.Fprintln(w, "The file contents have changed server-side!")
				} else {
					w.WriteHeader(http.StatusNotFound)
					fmt.Fprintln(w, "No object with this id found")
				}
				return
			}
			
			fmt.Fprint(w, jsonStr)
			
			return
		}
	}
	
	w.WriteHeader(http.StatusBadRequest)
	fmt.Fprintln(w, "You must specifiy a user and a object id")
}