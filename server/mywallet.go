package main

import (
	"github.com/gorilla/mux"
	"log"
	"net/http"
)

func main() {
	rtr := mux.NewRouter()

	rtr.HandleFunc("/users", getAllUsersRequest).Methods("GET")
	rtr.HandleFunc("/users", signUpRequest).Methods("POST")
	rtr.HandleFunc("/users/{user}/categories", getCategoriesRequest).Methods("GET")
	rtr.HandleFunc("/users/{user}/categories", postCategoryRequest).Methods("POST")

	http.Handle("/", rtr)

	log.Println("Launching server...")
	err := http.ListenAndServe(":5678", nil)
	if err != nil {
		log.Fatalln(err)
	}
}
