package main

import (
	"encoding/json"
	"github.com/sweiler/mywallet/server/filemanager"
)

type UserRef struct {
	Username string `json:"username"`
	Password string `json:"password"`
	RefHash  string `json:"ref"`
}

type UsersEntry struct {
	Users  []*UserRef `json:"users"`
	Parent string     `json:"parent"`
}

func (this *UsersEntry) getUsers() []*UserRef {
	ref, err := filemanager.GetRef("users")
	if err != nil {
		this.Users = make([]*UserRef, 0)
		this.Parent = ""
		return this.Users
	}

	jsonString, err := json.Marshal(this)
	if err != nil {
		panic(err)
	}

	hash := filemanager.CreateHash(string(jsonString))
	if hash != ref {
		str, err := filemanager.RetrieveObject("users", ref)
		if err != nil {
			panic(err)
		}
		json.Unmarshal([]byte(str), this)
	}

	return this.Users

}

func (this *UsersEntry) save() {
	jsonString, err := json.Marshal(this)
	if err != nil {
		panic(err)
	}
	hash := filemanager.CreateObject("users", string(jsonString))
	filemanager.UpdateRef("users", hash)
}

func (this *UsersEntry) addUser(u *UserRef) {
	ref, err := filemanager.GetRef("users")
	if err != nil {
		ref = ""
	}
	this.Users = append(this.Users, u)
	this.Parent = ref
	this.save()
}
