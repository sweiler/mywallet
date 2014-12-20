package main

import (
	"io"
	"net/http"
	"os"
	"strings"
)

var client http.Client

var testServerStarted bool = false

func setUp() {
	if !testServerStarted {
		testServerStarted = true
		go main()
	}

}

func cleanUp() {
	os.RemoveAll("data")
}

func registerUser(username, password string) {
	signUp := "{\"username\":\"" + username + "\", \"password\":\"" + password + "\"}"

	http.Post("http://localhost:5678/users", "application/json", strings.NewReader(signUp))
}

func buildGet(url, username, password string) *http.Request {
	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("X-Mywallet-Auth", "{\"username\":\""+username+"\", \"password\":\""+password+"\"}")
	return req
}

func buildPost(url string, username string, password string, body io.Reader) *http.Request {
	req, _ := http.NewRequest("POST", url, body)

	req.Header.Add("X-Mywallet-Auth", "{\"username\":\""+username+"\", \"password\":\""+password+"\"}")
	return req
}
