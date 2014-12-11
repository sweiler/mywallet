package main

import (
	"testing"
	"net/http"
	"strings"
	"encoding/json"
	"io/ioutil"
)

func RegisterExample() {
	signUp := "{\"username\":\"Testuser\", \"password\":\"pwd\"}"

	http.Post("http://localhost:5678/users", "application/json", strings.NewReader(signUp))
}

func Test_MalformedObject(t *testing.T) {
	setUp()

	RegisterExample()
	
	testObj := "{\"Mega\":\"HAHAHA\"}"
	
	resp, err := http.Post("http://localhost:5678/users/Testuser/objects", "application/json",
		strings.NewReader(testObj))
	
	if err != nil {
		t.Fatalf("HTTP-Error: %v", err)
	}
	
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("HTTP-Status: %v", resp.Status)
	}
}

func Test_Objects(t *testing.T) {
	setUp()

	RegisterExample()
	
	testObj := "{\"data\":\"HAHAHA\", \"ref\":\"\"}"
	
	resp, err := http.Post("http://localhost:5678/users/Testuser/objects", "application/json",
		strings.NewReader(testObj))
	
	if err != nil {
		t.Fatalf("HTTP-Error: %v", err)
	}
	
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("HTTP-Status: %v", resp.Status)
	}
	
	answer := new(PostResponse)
	decoder := json.NewDecoder(resp.Body)
	err = decoder.Decode(answer)
	if err != nil {
		txt, _ := ioutil.ReadAll(resp.Body)
		t.Fatalf("Malformed response: %v", string(txt))
	}
	
	if len(answer.Hash) != 40 {
		t.Fatalf("Hash value has wrong length: %v", answer.Hash)
	}
	
	resp, err = http.Get("http://localhost:5678/users/Testuser")
	
	if err != nil {
		t.Fatalf("HTTP-Error: %v", err)
	}
	
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("HTTP-Status: %v", resp.Status)
	}
	
	currentUserData := new(User)
	decoder = json.NewDecoder(resp.Body)
	err = decoder.Decode(currentUserData)
	if err != nil {
		t.Fatalf("Decoding-Error: %v", err)
	}
	
	if currentUserData.Head != answer.Hash {
		t.Fatalf("User-Head not updated: %v", currentUserData.Head)
	}
	
	
	resp, err = http.Get("http://localhost:5678/users/Testuser/objects/" + answer.Hash)
	
	if err != nil {
		t.Fatalf("HTTP-Error: %v", err)
	}
	
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("HTTP-Status: %v", resp.Status)
	}
	
	txt, _ := ioutil.ReadAll(resp.Body)
	
	if string(txt) != testObj {
		t.Fatalf("Wrong object returned: '%v'", string(txt))
	}
	
	testObj = "{\"data\":{\"name\":\"Object2\"}, \"ref\":\"" + answer.Hash + "\"}"
	
	resp, err = http.Post("http://localhost:5678/users/Testuser/objects", "application/json",
		strings.NewReader(testObj))
	
	if err != nil {
		t.Fatalf("HTTP-Error: %v", err)
	}
	
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("HTTP-Status: %v", resp.Status)
	}
	
	cleanUp()
}

func Test_Reject(t *testing.T) {
	setUp()

	RegisterExample()
	
	testObj := "{\"data\":\"HAHAHA\", \"ref\":\"\"}"
	
	resp, err := http.Post("http://localhost:5678/users/Testuser/objects", "application/json",
		strings.NewReader(testObj))
	
	if err != nil {
		t.Fatalf("HTTP-Error: %v", err)
	}
	
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("HTTP-Status: %v", resp.Status)
	}
	
	answer := new(PostResponse)
	decoder := json.NewDecoder(resp.Body)
	err = decoder.Decode(answer)
	if err != nil {
		txt, _ := ioutil.ReadAll(resp.Body)
		t.Fatalf("Malformed response: %v", string(txt))
	}
	
	if len(answer.Hash) != 40 {
		t.Fatalf("Hash value has wrong length: %v", answer.Hash)
	}
	
	resp, err = http.Get("http://localhost:5678/users/Testuser/objects/" + answer.Hash)
	
	if err != nil {
		t.Fatalf("HTTP-Error: %v", err)
	}
	
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("HTTP-Status: %v", resp.Status)
	}
	
	txt, _ := ioutil.ReadAll(resp.Body)
	
	if string(txt) != testObj {
		t.Fatalf("Wrong object returned: '%v'", string(txt))
	}
	
	testObj = "{\"data\":{\"name\":\"Object2\"}, \"ref\":\"asdfd23ndn28d\"}"
	
	resp, err = http.Post("http://localhost:5678/users/Testuser/objects", "application/json",
		strings.NewReader(testObj))
	
	if err != nil {
		t.Fatalf("HTTP-Error: %v", err)
	}
	
	if resp.StatusCode != http.StatusConflict {
		t.Fatalf("HTTP-Status: %v", resp.Status)
	}
	
	
	
	cleanUp()
}