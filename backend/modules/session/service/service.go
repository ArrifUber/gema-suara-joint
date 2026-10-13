package service

import (
	"context"

	"joints-be/modules/session/dto"
	"joints-be/modules/session/entity"
	"joints-be/modules/session/repository"
)

type SessionService interface {
	CreateSession(ctx context.Context, req dto.CreateSessionRequest) (*dto.SessionResponse, error)
	GetSessionByID(ctx context.Context, id string) (*dto.SessionResponse, error)
	UpdateSession(ctx context.Context, id string, req dto.UpdateSessionRequest) (*dto.SessionResponse, error)
	CompleteSession(ctx context.Context, id string) (*dto.SessionResponse, error)
}

type sessionServiceImpl struct {
	repo repository.SessionRepository
}

func NewSessionService(repo repository.SessionRepository) SessionService {
	return &sessionServiceImpl{repo: repo}
}

func (s *sessionServiceImpl) CreateSession(ctx context.Context, req dto.CreateSessionRequest) (*dto.SessionResponse, error) {
	newSession := &entity.Session{
		Subject:  req.Subject,
		Topic:    req.Topic,
		Subtopic: req.Subtopic,
		Status:   entity.SessionStatusActive,
	}

	if err := s.repo.Create(ctx, newSession); err != nil {
		return nil, err
	}

	return toSessionResponse(newSession), nil
}

func (s *sessionServiceImpl) GetSessionByID(ctx context.Context, id string) (*dto.SessionResponse, error) {
	sess, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return toSessionResponse(sess), nil
}

func (s *sessionServiceImpl) UpdateSession(ctx context.Context, id string, req dto.UpdateSessionRequest) (*dto.SessionResponse, error) {
	sess, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Subject != nil {
		sess.Subject = *req.Subject
	}
	if req.Topic != nil {
		sess.Topic = *req.Topic
	}
	if req.Subtopic != nil {
		sess.Subtopic = *req.Subtopic
	}
	if req.Status != nil {
		sess.Status = entity.SessionStatus(*req.Status)
	}

	if err := s.repo.Update(ctx, sess); err != nil {
		return nil, err
	}

	return toSessionResponse(sess), nil
}

func (s *sessionServiceImpl) CompleteSession(ctx context.Context, id string) (*dto.SessionResponse, error) {
	sess, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	sess.Status = entity.SessionStatusCompleted
	if err := s.repo.Update(ctx, sess); err != nil {
		return nil, err
	}

	return toSessionResponse(sess), nil
}

func toSessionResponse(sess *entity.Session) *dto.SessionResponse {
	return &dto.SessionResponse{
		ID:        sess.ID,
		Subject:   sess.Subject,
		Topic:     sess.Topic,
		Subtopic:  sess.Subtopic,
		Status:    string(sess.Status),
		CreatedAt: sess.CreatedAt,
		UpdatedAt: sess.UpdatedAt,
	}
}
