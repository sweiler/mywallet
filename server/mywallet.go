package main

import "net/http"
import "fmt"

func defaultHandler(w http.ResponseWriter, req *http.Request) {
	fmt.Fprintln(w, "Hi @ all, i can use Ümlauts")
}

func main() {
	http.HandleFunc("/", defaultHandler)
	http.ListenAndServe(":5678", nil)
}
