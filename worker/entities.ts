import { IndexedEntity } from "./core-utils";
import type { Shooter, Stage, Score } from "@shared/types";
import { MOCK_SHOOTERS, MOCK_STAGES } from "@shared/mock-data";
// SHOOTER ENTITY
export class ShooterEntity extends IndexedEntity<Shooter> {
  static readonly entityName = "shooter";
  static readonly indexName = "shooters";
  static readonly initialState: Shooter = { id: "", name: "", division: "Production" };
  static seedData = MOCK_SHOOTERS;
}
// STAGE ENTITY
export class StageEntity extends IndexedEntity<Stage> {
  static readonly entityName = "stage";
  static readonly indexName = "stages";
  static readonly initialState: Stage = { id: "", name: "", maxPoints: 0 };
  static seedData = MOCK_STAGES;
}
// SCORE ENTITY
export class ScoreEntity extends IndexedEntity<Score> {
  static readonly entityName = "score";
  static readonly indexName = "scores";
  static readonly initialState: Score = { 
    id: "", 
    shooterId: "", 
    stageId: "", 
    time: 0, 
    a: 0, 
    c: 0, 
    d: 0, 
    miss: 0, 
    penalty: 0 
  };
}