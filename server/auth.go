package main

import (
	"crypto/sha1"
	"encoding/json"
	"io"
	"log"
	"net/http"
)

type userPasswordPair struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func auth(req *http.Request) (string, bool) {
	header := req.Header.Get("X-Mywallet-Auth")

	if header != "" {
		log.Println("Auth-header set")
		var upp userPasswordPair
		err := json.Unmarshal([]byte(header), &upp)
		if err != nil || upp.Username == "" || upp.Password == "" {
			log.Printf("Login failed empty, err: %v", err)
			log.Printf("usr: %v, password: %v", upp.Username, upp.Password)
			return "", false
		}

		usr := getUser(upp.Username)
		if usr == nil {
			log.Printf("Login failed usr not found")
			return "", false
		}

		hashing := usr.Salt + upp.Password
		h := sha1.New()
		io.WriteString(h, hashing)
		if string(h.Sum(nil)) == usr.Password {
			return usr.Username, true
		} else {
			log.Printf("Login failed, password hash is wrong")
			return "", false
		}

	} else {
		return "", false
	}
}
