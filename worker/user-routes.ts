import { Hono } from "hono";
import type { Env } from './core-utils';
import { ShooterEntity, StageEntity, ScoreEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { Shooter, Stage, Score } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // --- SHOOTERS ---
  // List Shooters
  app.get('/api/shooters', async (c) => {
    await ShooterEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await ShooterEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  // Create Shooter
  app.post('/api/shooters', async (c) => {
    const { name, division } = (await c.req.json()) as Partial<Shooter>;
    if (!isStr(name) || !isStr(division)) return bad(c, 'name and division are required');
    const shooter = { id: crypto.randomUUID(), name, division };
    return ok(c, await ShooterEntity.create(c.env, shooter));
  });
  // Get Shooter
  app.get('/api/shooters/:id', async (c) => {
    const id = c.req.param('id');
    const shooter = new ShooterEntity(c.env, id);
    if (!await shooter.exists()) return notFound(c, 'shooter not found');
    return ok(c, await shooter.getState());
  });
  // Update Shooter
  app.put('/api/shooters/:id', async (c) => {
    const id = c.req.param('id');
    const { name, division } = (await c.req.json()) as Partial<Shooter>;
    if (!isStr(name) || !isStr(division)) return bad(c, 'name and division are required');
    const shooter = new ShooterEntity(c.env, id);
    if (!await shooter.exists()) return notFound(c, 'shooter not found');
    await shooter.patch({ name, division });
    return ok(c, await shooter.getState());
  });
  // Delete Shooter
  app.delete('/api/shooters/:id', async (c) => {
    const id = c.req.param('id');
    // Also delete all scores for this shooter
    const allScores = await ScoreEntity.list(c.env);
    const shooterScores = allScores.items.filter(s => s.shooterId === id);
    for (const score of shooterScores) {
      await ScoreEntity.delete(c.env, score.id);
    }
    const deleted = await ShooterEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // --- STAGES ---
  // List Stages
  app.get('/api/stages', async (c) => {
    await StageEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await StageEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  // Create Stage
  app.post('/api/stages', async (c) => {
    const { name, maxPoints } = (await c.req.json()) as Partial<Stage>;
    if (!isStr(name) || typeof maxPoints !== 'number' || maxPoints <= 0) {
      return bad(c, 'name and a positive maxPoints are required');
    }
    const stage = { id: crypto.randomUUID(), name, maxPoints };
    return ok(c, await StageEntity.create(c.env, stage));
  });
  // Get Stage
  app.get('/api/stages/:id', async (c) => {
    const id = c.req.param('id');
    const stage = new StageEntity(c.env, id);
    if (!await stage.exists()) return notFound(c, 'stage not found');
    return ok(c, await stage.getState());
  });
  // Update Stage
  app.put('/api/stages/:id', async (c) => {
    const id = c.req.param('id');
    const { name, maxPoints } = (await c.req.json()) as Partial<Stage>;
    if (!isStr(name) || typeof maxPoints !== 'number' || maxPoints <= 0) {
      return bad(c, 'name and a positive maxPoints are required');
    }
    const stage = new StageEntity(c.env, id);
    if (!await stage.exists()) return notFound(c, 'stage not found');
    await stage.patch({ name, maxPoints });
    return ok(c, await stage.getState());
  });
  // Delete Stage
  app.delete('/api/stages/:id', async (c) => {
    const id = c.req.param('id');
    // Also delete all scores for this stage
    const allScores = await ScoreEntity.list(c.env);
    const stageScores = allScores.items.filter(s => s.stageId === id);
    for (const score of stageScores) {
      await ScoreEntity.delete(c.env, score.id);
    }
    const deleted = await StageEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // --- SCORES ---
  // List Scores
  app.get('/api/scores', async (c) => {
    const page = await ScoreEntity.list(c.env);
    return ok(c, page);
  });
  // Create Score
  app.post('/api/scores', async (c) => {
    const body = (await c.req.json()) as Omit<Score, 'id'>;
    // Basic validation
    if (!isStr(body.shooterId) || !isStr(body.stageId) || typeof body.time !== 'number' || body.time <= 0) {
      return bad(c, 'shooterId, stageId, and a positive time are required');
    }
    const score: Score = {
      id: crypto.randomUUID(),
      ...body
    };
    return ok(c, await ScoreEntity.create(c.env, score));
  });
}