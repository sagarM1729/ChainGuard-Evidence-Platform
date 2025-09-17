package main

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// EvidenceContract provides functions for managing evidence on the blockchain
type EvidenceContract struct {
	contractapi.Contract
}

// Evidence represents the evidence structure stored on blockchain
type Evidence struct {
	ID             string    `json:"id"`
	CaseID         string    `json:"caseId"`
	Filename       string    `json:"filename"`
	IPFSCid        string    `json:"ipfsCid"`
	FileHash       string    `json:"fileHash"`
	BlockchainHash string    `json:"blockchainHash"`
	CustodyOfficer string    `json:"custodyOfficer"`
	Timestamp      time.Time `json:"timestamp"`
	Status         string    `json:"status"`
	AccessLevel    string    `json:"accessLevel"`
}

// CustodyTransfer represents a custody change event
type CustodyTransfer struct {
	EvidenceID   string    `json:"evidenceId"`
	FromOfficer  string    `json:"fromOfficer"`
	ToOfficer    string    `json:"toOfficer"`
	Timestamp    time.Time `json:"timestamp"`
	Reason       string    `json:"reason"`
	TransactionID string   `json:"transactionId"`
}

// QueryResult structure used for handling result of query
type QueryResult struct {
	Key    string `json:"Key"`
	Record *Evidence
}

// InitLedger adds a base set of evidence to the ledger
func (s *EvidenceContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	evidence := []Evidence{
		{
			ID:             "evidence1",
			CaseID:         "case1",
			Filename:       "initial_evidence.pdf",
			IPFSCid:        "QmTestCID123",
			FileHash:       "sha256_hash_placeholder",
			BlockchainHash: "",
			CustodyOfficer: "officer.doe@police.gov",
			Timestamp:      time.Now(),
			Status:         "ACTIVE",
			AccessLevel:    "RESTRICTED",
		},
	}

	for _, evidenceItem := range evidence {
		evidenceItem.BlockchainHash = s.calculateBlockchainHash(evidenceItem)
		evidenceJSON, err := json.Marshal(evidenceItem)
		if err != nil {
			return err
		}

		err = ctx.GetStub().PutState(evidenceItem.ID, evidenceJSON)
		if err != nil {
			return fmt.Errorf("failed to put evidence to world state: %v", err)
		}
	}

	return nil
}

// CreateEvidence issues a new evidence to the world state with given details
func (s *EvidenceContract) CreateEvidence(ctx contractapi.TransactionContextInterface, 
	id string, caseId string, filename string, ipfsCid string, fileHash string, 
	custodyOfficer string, accessLevel string) error {
	
	exists, err := s.EvidenceExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("evidence %s already exists", id)
	}

	evidence := Evidence{
		ID:             id,
		CaseID:         caseId,
		Filename:       filename,
		IPFSCid:        ipfsCid,
		FileHash:       fileHash,
		CustodyOfficer: custodyOfficer,
		Timestamp:      time.Now(),
		Status:         "ACTIVE",
		AccessLevel:    accessLevel,
	}

	// Calculate blockchain hash for immutable verification
	evidence.BlockchainHash = s.calculateBlockchainHash(evidence)

	evidenceJSON, err := json.Marshal(evidence)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, evidenceJSON)
}

// ReadEvidence returns the evidence stored in the world state with given id
func (s *EvidenceContract) ReadEvidence(ctx contractapi.TransactionContextInterface, id string) (*Evidence, error) {
	evidenceJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if evidenceJSON == nil {
		return nil, fmt.Errorf("evidence %s does not exist", id)
	}

	var evidence Evidence
	err = json.Unmarshal(evidenceJSON, &evidence)
	if err != nil {
		return nil, err
	}

	return &evidence, nil
}

// UpdateEvidenceStatus changes the status of an existing evidence
func (s *EvidenceContract) UpdateEvidenceStatus(ctx contractapi.TransactionContextInterface, id string, newStatus string) error {
	evidence, err := s.ReadEvidence(ctx, id)
	if err != nil {
		return err
	}

	evidence.Status = newStatus
	evidence.Timestamp = time.Now()
	
	// Recalculate blockchain hash
	evidence.BlockchainHash = s.calculateBlockchainHash(*evidence)

	evidenceJSON, err := json.Marshal(evidence)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, evidenceJSON)
}

// TransferCustody transfers evidence custody to a new officer
func (s *EvidenceContract) TransferCustody(ctx contractapi.TransactionContextInterface, 
	evidenceId string, newOfficer string, reason string) error {
	
	evidence, err := s.ReadEvidence(ctx, evidenceId)
	if err != nil {
		return err
	}

	// Create custody transfer record
	transfer := CustodyTransfer{
		EvidenceID:    evidenceId,
		FromOfficer:   evidence.CustodyOfficer,
		ToOfficer:     newOfficer,
		Timestamp:     time.Now(),
		Reason:        reason,
		TransactionID: ctx.GetStub().GetTxID(),
	}

	// Store custody transfer as composite key
	transferKey, err := ctx.GetStub().CreateCompositeKey("custody_transfer", []string{evidenceId, strconv.FormatInt(time.Now().Unix(), 10)})
	if err != nil {
		return err
	}

	transferJSON, err := json.Marshal(transfer)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(transferKey, transferJSON)
	if err != nil {
		return err
	}

	// Update evidence custody officer
	evidence.CustodyOfficer = newOfficer
	evidence.Timestamp = time.Now()
	evidence.BlockchainHash = s.calculateBlockchainHash(*evidence)

	evidenceJSON, err := json.Marshal(evidence)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(evidenceId, evidenceJSON)
}

// VerifyIntegrity verifies evidence integrity by comparing hashes
func (s *EvidenceContract) VerifyIntegrity(ctx contractapi.TransactionContextInterface, 
	id string, currentFileHash string) (*map[string]interface{}, error) {
	
	evidence, err := s.ReadEvidence(ctx, id)
	if err != nil {
		return nil, err
	}

	result := map[string]interface{}{
		"evidenceId":        evidence.ID,
		"originalHash":      evidence.FileHash,
		"currentHash":       currentFileHash,
		"hashMatch":         evidence.FileHash == currentFileHash,
		"blockchainHash":    evidence.BlockchainHash,
		"timestamp":         evidence.Timestamp,
		"custodyOfficer":    evidence.CustodyOfficer,
		"verifiedAt":        time.Now(),
	}

	return &result, nil
}

// GetEvidenceHistory returns the transaction history for an evidence
func (s *EvidenceContract) GetEvidenceHistory(ctx contractapi.TransactionContextInterface, id string) ([]QueryResult, error) {
	resultsIterator, err := ctx.GetStub().GetHistoryForKey(id)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var records []QueryResult
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var evidence Evidence
		if len(response.Value) > 0 {
			err := json.Unmarshal(response.Value, &evidence)
			if err != nil {
				return nil, err
			}
		} else {
			evidence = Evidence{
				ID: id,
			}
		}

		record := QueryResult{
			Key:    response.TxId,
			Record: &evidence,
		}
		records = append(records, record)
	}

	return records, nil
}

// GetCustodyChain returns the custody transfer history for an evidence
func (s *EvidenceContract) GetCustodyChain(ctx contractapi.TransactionContextInterface, evidenceId string) ([]CustodyTransfer, error) {
	resultsIterator, err := ctx.GetStub().GetStateByPartialCompositeKey("custody_transfer", []string{evidenceId})
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var transfers []CustodyTransfer
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var transfer CustodyTransfer
		err = json.Unmarshal(response.Value, &transfer)
		if err != nil {
			return nil, err
		}

		transfers = append(transfers, transfer)
	}

	return transfers, nil
}

// QueryEvidenceByCase returns all evidence for a specific case
func (s *EvidenceContract) QueryEvidenceByCase(ctx contractapi.TransactionContextInterface, caseId string) ([]*Evidence, error) {
	queryString := fmt.Sprintf(`{"selector":{"caseId":"%s"}}`, caseId)
	return s.getQueryResultForQueryString(ctx, queryString)
}

// QueryEvidenceByOfficer returns all evidence under a specific officer's custody
func (s *EvidenceContract) QueryEvidenceByOfficer(ctx contractapi.TransactionContextInterface, officer string) ([]*Evidence, error) {
	queryString := fmt.Sprintf(`{"selector":{"custodyOfficer":"%s","status":"ACTIVE"}}`, officer)
	return s.getQueryResultForQueryString(ctx, queryString)
}

// EvidenceExists returns true when evidence with given ID exists in world state
func (s *EvidenceContract) EvidenceExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	evidenceJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return evidenceJSON != nil, nil
}

// getQueryResultForQueryString executes the passed query string
func (s *EvidenceContract) getQueryResultForQueryString(ctx contractapi.TransactionContextInterface, queryString string) ([]*Evidence, error) {
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	return constructQueryResponseFromIterator(resultsIterator)
}

// constructQueryResponseFromIterator constructs a slice of evidence from the resultsIterator
func constructQueryResponseFromIterator(resultsIterator contractapi.StateQueryIteratorInterface) ([]*Evidence, error) {
	var evidences []*Evidence
	for resultsIterator.HasNext() {
		queryResult, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		var evidence Evidence
		err = json.Unmarshal(queryResult.Value, &evidence)
		if err != nil {
			return nil, err
		}
		evidences = append(evidences, &evidence)
	}

	return evidences, nil
}

// calculateBlockchainHash creates an immutable hash for blockchain verification
func (s *EvidenceContract) calculateBlockchainHash(evidence Evidence) string {
	data := fmt.Sprintf("%s%s%s%s%s%s", 
		evidence.ID, 
		evidence.CaseID, 
		evidence.IPFSCid, 
		evidence.FileHash, 
		evidence.CustodyOfficer, 
		evidence.Timestamp.Format(time.RFC3339))
	
	hash := sha256.Sum256([]byte(data))
	return fmt.Sprintf("%x", hash)
}

func main() {
	evidenceChaincode, err := contractapi.NewChaincode(&EvidenceContract{})
	if err != nil {
		fmt.Printf("Error creating evidence chaincode: %v", err)
	}

	if err := evidenceChaincode.Start(); err != nil {
		fmt.Printf("Error starting evidence chaincode: %v", err)
	}
}
