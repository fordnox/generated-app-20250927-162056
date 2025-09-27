import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Shooter, Stage, Score } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle } from "lucide-react";
const scoreSchema = z.object({
  time: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().positive({ message: "Time must be a positive number." })),
  a: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().int().min(0, { message: "Hits cannot be negative." })),
  c: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().int().min(0, { message: "Hits cannot be negative." })),
  d: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().int().min(0, { message: "Hits cannot be negative." })),
  miss: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().int().min(0, { message: "Misses cannot be negative." })),
  penalty: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().int().min(0, { message: "Penalties cannot be negative." })),
});
type ScoreFormData = z.infer<typeof scoreSchema>;
export function ScoringPage() {
  const [selectedShooterId, setSelectedShooterId] = useState<string | undefined>();
  const [selectedStageId, setSelectedStageId] = useState<string | undefined>();
  const queryClient = useQueryClient();
  const { data: shootersData, isLoading: isLoadingShooters } = useQuery<{ items: Shooter[] }>({
    queryKey: ["shooters"],
    queryFn: () => api("/api/shooters"),
  });
  const { data: stagesData, isLoading: isLoadingStages } = useQuery<{ items: Stage[] }>({
    queryKey: ["stages"],
    queryFn: () => api("/api/stages"),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ScoreFormData>({
    resolver: zodResolver(scoreSchema),
    defaultValues: { time: 0, a: 0, c: 0, d: 0, miss: 0, penalty: 0 },
  });
  const formValues = watch();
  const hitFactor = useMemo(() => {
    const { time, a, c, d, miss, penalty } = formValues;
    if (!time || time <= 0) return 0;
    const points = (a * 5) + (c * 3) + (d * 1) - (miss * 10) - (penalty * 10);
    return (points / time).toFixed(4);
  }, [formValues]);
  const mutation = useMutation({
    mutationFn: (data: ScoreFormData) => {
      if (!selectedShooterId || !selectedStageId) {
        throw new Error("Shooter and Stage must be selected.");
      }
      const scorePayload: Omit<Score, 'id'> = {
        shooterId: selectedShooterId,
        stageId: selectedStageId,
        time: data.time,
        a: data.a,
        c: data.c,
        d: data.d,
        miss: data.miss,
        penalty: data.penalty,
      };
      return api<Score>("/api/scores", {
        method: "POST",
        body: JSON.stringify(scorePayload),
      });
    },
    onSuccess: () => {
      toast.success("Score saved successfully!");
      reset();
      queryClient.invalidateQueries({ queryKey: ["scores"] });
    },
    onError: (error) => {
      toast.error(`Failed to save score: ${error.message}`);
    },
  });
  const onSubmit = (data: ScoreFormData) => {
    mutation.mutate(data);
  };
  const isLoading = isLoadingShooters || isLoadingStages;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Scoring</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Enter shooter performance data for each stage.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Score Entry</CardTitle>
          <CardDescription>Select a shooter and a stage to begin.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label>Shooter</Label>
                <Select onValueChange={setSelectedShooterId} value={selectedShooterId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a shooter" />
                  </SelectTrigger>
                  <SelectContent>
                    {shootersData?.items.map((shooter) => (
                      <SelectItem key={shooter.id} value={shooter.id}>
                        {shooter.name} ({shooter.division})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select onValueChange={setSelectedStageId} value={selectedStageId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stagesData?.items.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {selectedShooterId && selectedStageId && (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 border-t pt-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(Object.keys(scoreSchema.shape) as Array<keyof ScoreFormData>).map((key) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="uppercase">{key}</Label>
                    <Input id={key} type="number" {...register(key, { valueAsNumber: true })} min="0" step={key === 'time' ? '0.01' : '1'} />
                    {errors[key] && <p className="text-sm text-red-500">{errors[key]?.message}</p>}
                  </div>
                ))}
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-lg bg-muted p-4">
                <div className="text-center md:text-left">
                  <p className="text-sm font-medium text-muted-foreground">Calculated Hit Factor</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{hitFactor}</p>
                </div>
                <Button type="submit" size="lg" disabled={mutation.isPending} className="w-full md:w-auto">
                  {mutation.isPending ? "Saving..." : <><CheckCircle className="mr-2 h-4 w-4" /> Save Score</>}
                </Button>
              </div>
            </motion.form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}