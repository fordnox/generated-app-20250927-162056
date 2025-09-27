import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Stage } from "@shared/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PlusCircle, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
const stageSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  maxPoints: z.coerce
    .number()
    .int()
    .positive({ message: "Max points must be a positive number." }),
});
type StageFormData = z.infer<typeof stageSchema>;
function StageForm({
  stage,
  onSuccess,
}: {
  stage?: Stage;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StageFormData>({
    resolver: zodResolver<typeof stageSchema>(stageSchema),
    defaultValues: stage || { name: "", maxPoints: 160 },
  });
  const mutation = useMutation({
    mutationFn: (data: StageFormData) => {
      const payload = stage ? { ...stage, ...data } : data;
      return api<Stage>(stage ? `/api/stages/${stage.id}` : "/api/stages", {
        method: stage ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stages"] });
      toast.success(`Stage ${stage ? "updated" : "created"} successfully!`);
      onSuccess();
      reset();
    },
    onError: (error) => {
      toast.error(`Failed to ${stage ? "update" : "create"} stage: ${error.message}`);
    },
  });
  const onSubmit = (data: StageFormData) => {
    mutation.mutate(data);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Stage Name</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="e.g. El Presidente"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxPoints">Maximum Points</Label>
        <Input
          id="maxPoints"
          type="number"
          {...register("maxPoints", { valueAsNumber: true })}
          placeholder="e.g. 160"
          className={errors.maxPoints ? "border-red-500" : ""}
        />
        {errors.maxPoints && (
          <p className="text-sm text-red-500">{errors.maxPoints.message}</p>
        )}
      </div>
      <DialogFooter>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Saving..."
            : stage
            ? "Save Changes"
            : "Create Stage"}
        </Button>
      </DialogFooter>
    </form>
  );
}
const MotionTableBody = motion(TableBody) as any;
const MotionTableRow = motion(TableRow);
export function StagesPage() {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage | undefined>(
    undefined
  );
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<{ items: Stage[] }>({
    queryKey: ["stages"],
    queryFn: () => api("/api/stages"),
  });
  const deleteMutation = useMutation({
    mutationFn: (stageId: string) =>
      api(`/api/stages/${stageId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stages"] });
      toast.success("Stage deleted successfully!");
      setAlertOpen(false);
      setSelectedStage(undefined);
    },
    onError: (error) => {
      toast.error(`Failed to delete stage: ${error.message}`);
    },
  });
  const handleEdit = (stage: Stage) => {
    setSelectedStage(stage);
    setFormOpen(true);
  };
  const handleDelete = (stage: Stage) => {
    setSelectedStage(stage);
    setAlertOpen(true);
  };
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Stages
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Define the courses of fire for the match.
          </p>
        </div>
        <Dialog
          open={isFormOpen}
          onOpenChange={(isOpen) => {
            setFormOpen(isOpen);
            if (!isOpen) setSelectedStage(undefined);
          }}
        >
          <DialogTrigger asChild>
            <Button className="transition-all duration-200 hover:scale-105 active:scale-95">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Stage
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedStage ? "Edit Stage" : "Add New Stage"}
              </DialogTitle>
              <DialogDescription>
                {selectedStage
                  ? "Update the details for this stage."
                  : "Enter the details for the new stage."}
              </DialogDescription>
            </DialogHeader>
            <StageForm
              stage={selectedStage}
              onSuccess={() => setFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Match Stages</CardTitle>
          <CardDescription>
            A list of all stages defined for the event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Max Points</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <MotionTableBody
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-red-500">
                    Failed to load stages: {(error as Error).message}
                  </TableCell>
                </TableRow>
              ) : data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    <h3 className="text-lg font-semibold">No Stages Found</h3>
                    <p className="text-muted-foreground">
                      Click "Add Stage" to get started.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((stage, index) => (
                  <MotionTableRow
                    key={stage.id}
                    variants={itemVariants}
                    layout
                  >
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{stage.name}</TableCell>
                    <TableCell>{stage.maxPoints}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(stage)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(stage)}
                            className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </MotionTableRow>
                ))
              )}
            </MotionTableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              stage "{selectedStage?.name}" and all associated scores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedStage && deleteMutation.mutate(selectedStage.id)
              }
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}