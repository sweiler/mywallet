package filemanager

import (
	"bytes"
	"crypto/sha1"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"strings"
	"errors"
)

func UpdateRef(refname, hash string) error {

	err := os.MkdirAll("data/refs", 0700)
	if err != nil {
		return err
	}

	ioutil.WriteFile("data/refs/"+refname, []byte(hash), 0600)

	return nil
}

func GetRef(refname string) (string, error) {
	contents, err := ioutil.ReadFile("data/refs/" + refname)
	if err != nil {
		return "error", err
	}

	return string(contents), nil
}

func CreateHash(contents string) string {
	h := sha1.New()
	io.WriteString(h, contents)
	byteSlice := make([]byte, 0, 40)
	buf := bytes.NewBuffer(byteSlice)
	fmt.Fprintf(buf, "%x", h.Sum(nil))

	return buf.String()
}

func CreateObject(prefix, contents string) string {
	hash := CreateHash(contents)

	dirName := "data/" + prefix + "/objects/" + hash[:2]
	fileName := hash[2:]

	byteData, err := ioutil.ReadAll(strings.NewReader(contents))
	if err != nil {
		fmt.Errorf("Error: %v", err)
		return "<error>"
	}

	os.MkdirAll(dirName, 0700)
	ioutil.WriteFile(dirName+"/"+fileName, byteData, 0600)

	return hash
}

func RetrieveObject(prefix, hash string) (string, error) {
	dirName := "data/" + prefix + "/objects/" + hash[:2] + "/"
	fileName := dirName + hash[2:]

	byteContent, err := ioutil.ReadFile(fileName)

	if err != nil {
		return "", err
	}
	
	h := CreateHash(string(byteContent))
	if h != hash {
		return "", errors.New("File content has changed")
	}

	return string(byteContent), nil
}
