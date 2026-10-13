package providers

import (
	"github.com/samber/do"
	"gorm.io/gorm"

	"joints-be/config"
	contextController "joints-be/modules/context/controller"
	contextRepo "joints-be/modules/context/repository"
	contextService "joints-be/modules/context/service"
	contextWorker "joints-be/modules/context/worker"
	sessionRepo "joints-be/modules/session/repository"
	transcriptRepo "joints-be/modules/transcript/repository"
	"joints-be/pkg/contextengine"
	"joints-be/pkg/event"
)

// ProvideContextEngine registers the ContextEngine implementation.
// Dynamically switches between Gemini and Mock based on AI_PROVIDER and AI_API_KEY.
func ProvideContextEngine(i *do.Injector) {
	do.Provide(i, func(i *do.Injector) (contextengine.ContextEngine, error) {
		cfg := config.AppConfig
		if cfg != nil && cfg.AIProvider == "gemini" && cfg.AIAPIKey != "" {
			return contextengine.NewGeminiContextEngine(cfg.AIAPIKey, cfg.AIModel), nil
		}
		return contextengine.NewMockContextEngine(), nil
	})
}

// ProvideContext registers all context-related dependencies into the DI injector.
func ProvideContext(i *do.Injector) {
	do.Provide(i, func(i *do.Injector) (contextRepo.ContextRepository, error) {
		db := do.MustInvoke[*gorm.DB](i)
		return contextRepo.NewContextRepository(db), nil
	})

	do.Provide(i, func(i *do.Injector) (contextService.ContextService, error) {
		cRepo := do.MustInvoke[contextRepo.ContextRepository](i)
		sRepo := do.MustInvoke[sessionRepo.SessionRepository](i)
		tRepo := do.MustInvoke[transcriptRepo.TranscriptRepository](i)
		engine := do.MustInvoke[contextengine.ContextEngine](i)
		publisher := do.MustInvoke[event.EventPublisher](i)
		return contextService.NewContextService(cRepo, sRepo, tRepo, engine, publisher), nil
	})

	do.Provide(i, func(i *do.Injector) (*contextController.ContextController, error) {
		svc := do.MustInvoke[contextService.ContextService](i)
		return contextController.NewContextController(svc), nil
	})

	do.Provide(i, func(i *do.Injector) (*contextWorker.ContextWorker, error) {
		svc := do.MustInvoke[contextService.ContextService](i)
		tRepo := do.MustInvoke[transcriptRepo.TranscriptRepository](i)
		return contextWorker.NewContextWorker(svc, tRepo), nil
	})
}
