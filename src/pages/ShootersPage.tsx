import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Shooter } from "@shared/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
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
const shooterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  division: z.enum([
    "Open",
    "Standard",
    "Production",
    "Production Optics",
    "Classic",
    "Revolver",
  ]),
});
type ShooterFormData = z.infer<typeof shooterSchema>;
const DIVISIONS: Shooter["division"][] = [
  "Open",
  "Standard",
  "Production",
  "Production Optics",
  "Classic",
  "Revolver",
];
function ShooterForm({
  shooter,
  onSuccess,
}: {
  shooter?: Shooter;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ShooterFormData>({
    resolver: zodResolver(shooterSchema),
    defaultValues: shooter || { name: "", division: "Production" },
  });
  const mutation = useMutation({
    mutationFn: (data: ShooterFormData) => {
      const payload = shooter ? { ...shooter, ...data } : data;
      return api<Shooter>(
        shooter ? `/api/shooters/${shooter.id}` : "/api/shooters",
        {
          method: shooter ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shooters"] });
      toast.success(
        `Shooter ${shooter ? "updated" : "created"} successfully!`
      );
      onSuccess();
      reset();
    },
    onError: (error) => {
      toast.error(`Failed to ${shooter ? "update" : "create"} shooter: ${error.message}`);
    },
  });
  const onSubmit = (data: ShooterFormData) => {
    mutation.mutate(data);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Shooter Name</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="e.g. John Wick"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="division">Division</Label>
        <Controller
          name="division"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id="division">
                <SelectValue placeholder="Select a division" />
              </SelectTrigger>
              <SelectContent>
                {DIVISIONS.map((div) => (
                  <SelectItem key={div} value={div}>
                    {div}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.division && (
          <p className="text-sm text-red-500">{errors.division.message}</p>
        )}
      </div>
      <DialogFooter>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Saving..."
            : shooter
            ? "Save Changes"
            : "Create Shooter"}
        </Button>
      </DialogFooter>
    </form>
  );
}
const MotionTableBody = motion(TableBody);
const MotionTableRow = motion(TableRow);
export function ShootersPage() {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [selectedShooter, setSelectedShooter] = useState<Shooter | undefined>(
    undefined
  );
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<{ items: Shooter[] }>({
    queryKey: ["shooters"],
    queryFn: () => api("/api/shooters"),
  });
  const deleteMutation = useMutation({
    mutationFn: (shooterId: string) =>
      api(`/api/shooters/${shooterId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shooters"] });
      toast.success("Shooter deleted successfully!");
      setAlertOpen(false);
      setSelectedShooter(undefined);
    },
    onError: (error) => {
      toast.error(`Failed to delete shooter: ${error.message}`);
    },
  });
  const handleEdit = (shooter: Shooter) => {
    setSelectedShooter(shooter);
    setFormOpen(true);
  };
  const handleDelete = (shooter: Shooter) => {
    setSelectedShooter(shooter);
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
            Shooters
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Manage all registered competitors for the match.
          </p>
        </div>
        <Dialog
          open={isFormOpen}
          onOpenChange={(isOpen) => {
            setFormOpen(isOpen);
            if (!isOpen) setSelectedShooter(undefined);
          }}
        >
          <DialogTrigger asChild>
            <Button className="transition-all duration-200 hover:scale-105 active:scale-95">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Shooter
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedShooter ? "Edit Shooter" : "Add New Shooter"}
              </DialogTitle>
              <DialogDescription>
                {selectedShooter
                  ? "Update the details for this shooter."
                  : "Enter the details for the new shooter."}
              </DialogDescription>
            </DialogHeader>
            <ShooterForm
              shooter={selectedShooter}
              onSuccess={() => setFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Registered Shooters</CardTitle>
          <CardDescription>
            A list of all shooters participating in the event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Division</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <MotionTableBody
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-red-500">
                    Failed to load shooters: {(error as Error).message}
                  </TableCell>
                </TableRow>
              ) : data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    <h3 className="text-lg font-semibold">No Shooters Found</h3>
                    <p className="text-muted-foreground">
                      Click "Add Shooter" to get started.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((shooter, index) => (
                  <MotionTableRow
                    key={shooter.id}
                    variants={itemVariants}
                    layout
                  >
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{shooter.name}</TableCell>
                    <TableCell>{shooter.division}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(shooter)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(shooter)}
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
              shooter "{selectedShooter?.name}" and all associated scores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedShooter && deleteMutation.mutate(selectedShooter.id)
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