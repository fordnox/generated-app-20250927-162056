import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Score, Shooter, Stage } from "@shared/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { Award, Star } from "lucide-react";
interface CombinedData {
  scores: Score[];
  shooters: Shooter[];
  stages: Stage[];
}
interface StageResult {
  shooterId: string;
  shooterName: string;
  division: string;
  hitFactor: number;
  points: number;
  rank: number;
}
interface OverallResultRow {
  shooterId: string;
  shooterName: string;
  division: string;
  stageResults: { [stageId: string]: { hitFactor: number; points: number } };
  totalPoints: number;
  matchPercent: number;
}
export function ResultsPage() {
  const { data, isLoading, error } = useQuery<CombinedData>({
    queryKey: ["results"],
    queryFn: async () => {
      const [scoresRes, shootersRes, stagesRes] = await Promise.all([
        api<{ items: Score[] }>("/api/scores"),
        api<{ items: Shooter[] }>("/api/shooters"),
        api<{ items: Stage[] }>("/api/stages"),
      ]);
      return {
        scores: scoresRes.items,
        shooters: shootersRes.items,
        stages: stagesRes.items,
      };
    },
  });
  const { overallResults, stageResults, stages } = useMemo(() => {
    if (!data) return { overallResults: [], stageResults: {}, stages: [] };
    const { scores, shooters, stages } = data;
    const shootersMap = new Map(shooters.map(s => [s.id, s]));
    // 1. Calculate Hit Factors for every score
    const scoresWithHf = scores.map(score => {
      const points = (score.a * 5) + (score.c * 3) + (score.d * 1) - (score.miss * 10) - (score.penalty * 10);
      const hitFactor = score.time > 0 ? points / score.time : 0;
      return { ...score, hitFactor };
    });
    // 2. Find the highest Hit Factor for each stage
    const stageHighHitFactors: { [stageId: string]: number } = {};
    for (const stage of stages) {
      const highestHf = Math.max(0, ...scoresWithHf.filter(s => s.stageId === stage.id).map(s => s.hitFactor));
      stageHighHitFactors[stage.id] = highestHf;
    }
    // 3. Calculate stage points for each score
    const scoresWithPoints = scoresWithHf.map(score => {
      const stage = stages.find(s => s.id === score.stageId);
      const highHf = stageHighHitFactors[score.stageId];
      const stagePoints = (stage && highHf > 0) ? (score.hitFactor / highHf) * stage.maxPoints : 0;
      return { ...score, stagePoints };
    });
    // 4. Aggregate results by shooter for overall standings
    const overallResultsMap = new Map<string, OverallResultRow>();
    shooters.forEach(shooter => {
      overallResultsMap.set(shooter.id, {
        shooterId: shooter.id,
        shooterName: shooter.name,
        division: shooter.division,
        stageResults: {},
        totalPoints: 0,
        matchPercent: 0,
      });
    });
    scoresWithPoints.forEach(score => {
      const resultRow = overallResultsMap.get(score.shooterId);
      if (resultRow) {
        resultRow.stageResults[score.stageId] = { hitFactor: score.hitFactor, points: score.stagePoints };
        resultRow.totalPoints += score.stagePoints;
      }
    });
    const overallResults = Array.from(overallResultsMap.values());
    const matchHighPoints = Math.max(0, ...overallResults.map(r => r.totalPoints));
    overallResults.forEach(result => {
      result.matchPercent = matchHighPoints > 0 ? (result.totalPoints / matchHighPoints) * 100 : 0;
    });
    overallResults.sort((a, b) => b.totalPoints - a.totalPoints);
    // 5. Calculate per-stage results
    const stageResults: { [stageId: string]: StageResult[] } = {};
    for (const stage of stages) {
      const resultsForStage = scoresWithPoints
        .filter(s => s.stageId === stage.id)
        .map(score => {
          const shooter = shootersMap.get(score.shooterId);
          return {
            shooterId: score.shooterId,
            shooterName: shooter?.name ?? "Unknown",
            division: shooter?.division ?? "N/A",
            hitFactor: score.hitFactor,
            points: score.stagePoints,
            rank: 0, // will be calculated next
          };
        });
      resultsForStage.sort((a, b) => b.points - a.points);
      resultsForStage.forEach((res, index) => res.rank = index + 1);
      stageResults[stage.id] = resultsForStage;
    }
    return { overallResults, stageResults, stages };
  }, [data]);
  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-yellow-700";
    return "";
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Results</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Live leaderboard and match standings.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Overall Standings</CardTitle>
          <CardDescription>Results are updated in real-time as scores are entered.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Shooter</TableHead>
                <TableHead>Division</TableHead>
                {stages.map(stage => (
                  <TableHead key={stage.id} className="text-center">{stage.name}</TableHead>
                ))}
                <TableHead className="text-right">Total Points</TableHead>
                <TableHead className="text-right">Match %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    {stages.map(stage => (
                      <TableCell key={stage.id}><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                    ))}
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4 + stages.length} className="text-center text-red-500">
                    Failed to load results: {(error as Error).message}
                  </TableCell>
                </TableRow>
              ) : overallResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4 + stages.length} className="text-center py-10">
                    <h3 className="text-lg font-semibold">No Scores Recorded</h3>
                    <p className="text-muted-foreground">
                      Go to the Scoring page to enter the first score.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                overallResults.map((result, index) => (
                  <TableRow key={result.shooterId} className={index < 3 ? "bg-muted/50" : ""}>
                    <TableCell className="font-medium text-center">
                      <span className={`flex items-center justify-center gap-1 ${getRankColor(index + 1)}`}>
                        {index < 3 && <Award className="h-4 w-4" />}
                        {index + 1}
                      </span>
                    </TableCell>
                    <TableCell>{result.shooterName}</TableCell>
                    <TableCell>{result.division}</TableCell>
                    {stages.map(stage => (
                      <TableCell key={stage.id} className="text-center">
                        {result.stageResults[stage.id]?.points.toFixed(2) ?? 'N/A'}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-semibold">{result.totalPoints.toFixed(4)}</TableCell>
                    <TableCell className="text-right">{result.matchPercent.toFixed(2)}%</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {stages.map(stage => (
          <Card key={stage.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                {stage.name} Results
              </CardTitle>
              <CardDescription>Points based on {stage.maxPoints} max</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Shooter</TableHead>
                    <TableHead className="text-right">Hit Factor</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : (stageResults[stage.id] && stageResults[stage.id].length > 0) ? (
                    stageResults[stage.id].map(res => (
                      <TableRow key={res.shooterId}>
                        <TableCell className={`font-medium ${getRankColor(res.rank)}`}>{res.rank}</TableCell>
                        <TableCell>{res.shooterName}</TableCell>
                        <TableCell className="text-right">{res.hitFactor.toFixed(4)}</TableCell>
                        <TableCell className="text-right font-semibold">{res.points.toFixed(4)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground h-24">No scores for this stage yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}