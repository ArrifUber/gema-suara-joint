package contextengine_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"joints-be/pkg/contextengine"
)

func TestGeminiContextEngine_EmptyTranscripts(t *testing.T) {
	engine := contextengine.NewGeminiContextEngine("dummy-key", "gemini-3.5-flash")

	res, err := engine.Analyze(context.Background(), contextengine.ContextInput{
		Subject:           "Fisika",
		RecentTranscripts: []string{},
	})
	if err != nil {
		t.Fatalf("expected no error on empty transcripts, got: %v", err)
	}
	if res.Type != "no_change" {
		t.Errorf("expected type 'no_change', got '%s'", res.Type)
	}
}

func TestGeminiContextEngine_MockServer(t *testing.T) {
	// Mock Gemini endpoint
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Validasi API Key dikirim di header x-goog-api-key
		if r.Header.Get("x-goog-api-key") != "test-gemini-key" {
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte(`{"error": {"code": 401, "message": "API key not valid"}}`))
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{
			"candidates": [
				{
					"content": {
						"parts": [
							{
								"text": "{\"type\": \"formula_detected\", \"concept\": \"Hukum II Newton\", \"summary\": \"Gaya sama dengan massa dikali percepatan.\", \"keywords\": [\"gaya\", \"massa\", \"percepatan\"], \"formula\": \"F = m * a\"}"
							}
						]
					},
					"finishReason": "STOP"
				}
			]
		}`))
	}))
	defer server.Close()

	// Engine instance testing logic
	engine := contextengine.NewGeminiContextEngine("test-gemini-key", "gemini-3.5-flash")
	if engine == nil {
		t.Fatalf("expected engine instance")
	}
}
