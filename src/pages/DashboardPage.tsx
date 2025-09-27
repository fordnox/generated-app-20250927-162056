import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, Variants } from "framer-motion";
import { Users, Target, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Shooter, Stage, Score } from "@shared/types";
import { Skeleton } from "@/components/ui/skeleton";
interface CombinedData {
  shooters: { items: Shooter[] };
  stages: { items: Stage[] };
  scores: { items: Score[] };
}
export function DashboardPage() {
  const { data, isLoading } = useQuery<CombinedData>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const [shooters, stages, scores] = await Promise.all([
        api<{ items: Shooter[] }>("/api/shooters"),
        api<{ items: Stage[] }>("/api/stages"),
        api<{ items: Score[] }>("/api/scores"),
      ]);
      return { shooters, stages, scores };
    },
  });
  const stats = [
    {
      title: "Total Shooters",
      value: data?.shooters.items.length ?? 0,
      icon: <Users className="h-8 w-8 text-blue-500" />,
      color: "from-blue-500/10 to-blue-500/0",
    },
    {
      title: "Total Stages",
      value: data?.stages.items.length ?? 0,
      icon: <Target className="h-8 w-8 text-green-500" />,
      color: "from-green-500/10 to-green-500/0",
    },
    {
      title: "Scores Recorded",
      value: data?.scores.items.length ?? 0,
      icon: <Trophy className="h-8 w-8 text-yellow-500" />,
      color: "from-yellow-500/10 to-yellow-500/0",
    },
  ];
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Welcome to Apex Scorer. Here's a quick overview of your match.
        </p>
      </header>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {stats.map((stat, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} -z-10`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {stat.title}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-10 w-20 mt-1" />
                ) : (
                  <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      <motion.div variants={itemVariants}>
        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              To begin setting up your match, please follow these steps:
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Navigate to the <strong className="text-blue-500">Shooters</strong> page to register all competitors.
              </li>
              <li>
                Go to the <strong className="text-blue-500">Stages</strong> page to define each course of fire.
              </li>
              <li>
                Once the match starts, use the <strong className="text-blue-500">Scoring</strong> page to enter scores.
              </li>
              <li>
                View live standings on the <strong className="text-blue-500">Results</strong> page.
              </li>
            </ol>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}