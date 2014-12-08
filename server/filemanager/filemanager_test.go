package filemanager

import (
	"testing"
	"os"
)

func cleanUp() {
	os.RemoveAll("data")
}

func Test_Filemanager(t *testing.T) {
	hash := CreateObject("testing_user1", "hihihi")
	content, err := RetrieveObject("testing_user1", hash)
	
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	
	if content != "hihihi" {
		t.Errorf("Returned Content should be 'hihihi' but was %v", content)
	}
	
	_, err = RetrieveObject("testing_user1", "ad23sas23df2asdb21d21d9732d2as2371e29da0")
	
	if err == nil {
		t.Error("Error expected, but none thrown")
	}
	cleanUp()
}

func Test_Refs(t *testing.T) {
	_, err := GetRef("adsnfkdscnvö")
	if err == nil {
		t.Error("Error expected, but none thrown")
	}
	
	err = UpdateRef("testing_ref", "ad23sas23df2asdb21d21d9732d2as2371e29da0")
	if err != nil {
		t.Error("Unexpected error: %v", err)
	}
	
	ref, err := GetRef("testing_ref")
	if err != nil {
		t.Error("Unexpected error: %v", err)
	}
	
	if ref != "ad23sas23df2asdb21d21d9732d2as2371e29da0" {
		t.Error("Ref has a wrong value: %v", ref)
	}
	cleanUp()
}