package contextengine

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type GeminiContextEngine struct {
	apiKey     string
	model      string
	httpClient *http.Client
}

func NewGeminiContextEngine(apiKey string, model string) ContextEngine {
	if model == "" {
		model = "gemini-3.5-flash"
	}
	return &GeminiContextEngine{
		apiKey: apiKey,
		model:  model,
		httpClient: &http.Client{
			Timeout: 20 * time.Second,
		},
	}
}

// Request structure for Gemini REST API
type geminiContent struct {
	Parts []geminiPart `json:"parts"`
	Role  string       `json:"role,omitempty"`
}

type geminiPart struct {
	Text string `json:"text"`
}

type geminiGenerationConfig struct {
	ResponseMimeType string  `json:"responseMimeType,omitempty"`
	Temperature      float64 `json:"temperature,omitempty"`
}

type geminiRequest struct {
	SystemInstruction *geminiContent          `json:"systemInstruction,omitempty"`
	Contents          []geminiContent         `json:"contents"`
	GenerationConfig  *geminiGenerationConfig `json:"generationConfig,omitempty"`
}

type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
		FinishReason string `json:"finishReason"`
	} `json:"candidates"`
	Error *struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Status  string `json:"status"`
	} `json:"error,omitempty"`
}

func (g *GeminiContextEngine) Analyze(ctx context.Context, input ContextInput) (*ContextResult, error) {
	if len(input.RecentTranscripts) == 0 {
		return &ContextResult{Type: "no_change"}, nil
	}

	systemPrompt := `Kamu adalah Context Engine cerdas untuk aplikasi pembelajaran realtime.
Tugasmu adalah menganalisis potongan transkrip percakapan/suara pengajar (STT) terbaru dalam sebuah sesi belajar, lalu mengekstrak konsep materi pelajaran secara ringkas dan terstruktur.

FORMAT OUTPUT WAJIB BERUPA VALID JSON:
{
  "type": "concept_update" | "formula_detected" | "topic_changed" | "no_change",
  "concept": "Nama konsep atau teori yang sedang dibahas",
  "summary": "Ringkasan penjelasan materi yang padat dan jelas (1-2 kalimat)",
  "keywords": ["kata_kunci1", "kata_kunci2"],
  "formula": "Rumus matematika/fisika/kimia jika terdeteksi (contoh: F = m × a)"
}

ATURAN EVALUASI:
1. Jika transkrip terbaru HANYA berisi salam pembuka, obrolan santai, konfirmasi suara ("halo tes", "apakah terdengar"), jeda kata ("ee...", "oke jadi"), atau tidak membawa perubahan konsep materi yang bermakna, KEMBALIKAN:
   {"type": "no_change"}
2. Jika terdeteksi rumus/formula spesifik, gunakan type "formula_detected" dan sertakan field "formula".
3. Gunakan Bahasa Indonesia yang baku dan akademis untuk summary dan concept.
4. Output HANYA raw JSON tanpa markdown fence.`

	// Format konteks saat ini
	currentContextDesc := "Belum ada konsep sebelumnya (awal sesi)."
	if input.CurrentContext != nil {
		currentContextDesc = fmt.Sprintf("Konsep sebelumnya: %s | Summary: %s",
			input.CurrentContext.Concept, input.CurrentContext.Summary)
		if input.CurrentContext.Formula != "" {
			currentContextDesc += fmt.Sprintf(" | Formula sebelumnya: %s", input.CurrentContext.Formula)
		}
	}

	recentText := strings.Join(input.RecentTranscripts, "\n- ")

	userPrompt := fmt.Sprintf(`INFORMASI SESI:
- Mata Pelajaran: %s
- Topik Utama: %s
- Subtopik: %s

KONTEKS TERAKHIR:
%s

TRANSKRIP TERBARU (STT CHUNKS):
- %s

Analisis transkrip di atas dan kembalikan JSON context update:`,
		input.Subject, input.Topic, input.Subtopic, currentContextDesc, recentText)

	reqPayload := geminiRequest{
		SystemInstruction: &geminiContent{
			Parts: []geminiPart{{Text: systemPrompt}},
		},
		Contents: []geminiContent{
			{
				Role:  "user",
				Parts: []geminiPart{{Text: userPrompt}},
			},
		},
		GenerationConfig: &geminiGenerationConfig{
			ResponseMimeType: "application/json",
			Temperature:      0.2,
		},
	}

	bodyBytes, err := json.Marshal(reqPayload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal gemini request: %w", err)
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent", g.model)

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create http request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("x-goog-api-key", g.apiKey)

	resp, err := g.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("gemini api request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read gemini response body: %w", err)
	}

	var geminiResp geminiResponse
	if err := json.Unmarshal(respBody, &geminiResp); err != nil {
		return nil, fmt.Errorf("failed to decode gemini response: %w", err)
	}

	if geminiResp.Error != nil {
		return nil, fmt.Errorf("gemini api error (code %d): %s", geminiResp.Error.Code, geminiResp.Error.Message)
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("gemini returned no candidates")
	}

	rawText := strings.TrimSpace(geminiResp.Candidates[0].Content.Parts[0].Text)
	// Clean markdown block if model accidentally included it
	rawText = strings.TrimPrefix(rawText, "```json")
	rawText = strings.TrimPrefix(rawText, "```")
	rawText = strings.TrimSuffix(rawText, "```")
	rawText = strings.TrimSpace(rawText)

	var result ContextResult
	if err := json.Unmarshal([]byte(rawText), &result); err != nil {
		return nil, fmt.Errorf("failed to parse structured context from gemini output: %w (raw: %s)", err, rawText)
	}

	if result.Type == "" {
		result.Type = "concept_update"
	}

	return &result, nil
}
