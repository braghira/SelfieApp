import {
  CheckCircle2,
  Clock,
  AlertCircleIcon,
  ArrowUpDown, 
  MoreHorizontal 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { useActivities } from "@/context/ActivityContext";
import { useAuth } from "@/context/AuthContext";
import useActivitiesApi from "@/hooks/useActivitiesApi";
import { useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef, FilterFn, Row } from "@tanstack/react-table";
import {
  ActivityType,
  cn,
} from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ActivityList() {
  const { user } = useAuth();
  const { activities } = useActivities();
  const { getActivities, completeActivity, deleteActivity } = useActivitiesApi();

  const activityFilter: FilterFn<ActivityType> = (
    row: Row<ActivityType>,
    columnId: string,
    filterValue: unknown
  ) => {
    const filter: string[] = filterValue as string[];
    let condition = false;
    if (filter.includes("late")) {
      condition ||=
        !row.getValue(columnId) &&
        new Date(row.getValue<string>("endDate")) < new Date();
    }
    if (filter.includes("in progress")) {
      condition ||=
        !row.getValue(columnId) &&
        new Date(row.getValue<string>("endDate")) > new Date();
    }
    if (filter.includes("done")) {
      condition ||= row.getValue(columnId);
    }
    return condition;
  };

  async function handleComplete(activity: ActivityType) {
    if (user) {
      completeActivity(activity);
    }
  }
  async function handleDelete(activity: ActivityType) {
    if (user) {
      deleteActivity(activity);
    }
  }

  const statuses = [
    {
      value: "late",
      label: "Late",
      icon: AlertCircleIcon,
    },
    {
      value: "in progress",
      label: "In Progress",
      icon: Clock,
    },
    {
      value: "done",
      label: "Done",
      icon: CheckCircle2,
    },
  ];

  const activityColumns: ColumnDef<ActivityType>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ cell, row }) => {
        const date = new Date(row.getValue<string>("endDate"));
        if (!row.getValue("completed") && date < new Date())
          return (
            <div className="text-destructive">{cell.getValue<string>()}</div>
          );
        else return <div>{cell.getValue<string>()}</div>;
      },
    },
    {
      accessorKey: "endDate",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Expiration
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ cell, row }) => {
        const date = new Date(cell.getValue<string>());
        const formatted = format(date, "dd/MM");
        let classname = "";
        if (!row.getValue("completed") && date < new Date())
          classname = "text-destructive";
        return (
          <div className={cn("font-semibold text-center", classname)}>
            {formatted}
          </div>
        );
      },
    },
    {
      accessorKey: "completed",
      header: "Status",
      cell: ({ row, cell }) => {
        if (cell.getValue())
          return "Completed";
        else if (
          !cell.getValue() &&
          new Date(row.getValue("endDate")) > new Date()
        ) {
          return <div className="text-blue-800">In progress</div>;
        } else return <div className="text-destructive">Late</div>;
      },
      filterFn: activityFilter,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild  onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleDelete(data)}}>
                Delete  
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {e.stopPropagation(); handleComplete(data)}}>
                Mark as Complete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  useEffect(() => {
    getActivities();
  }, []);

  return (
    <>
        <div className="mt-11">
          <Card className="bg-background">
            <CardHeader>
              <CardTitle>Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={activities}
                columns={activityColumns}
                filterColumnID="completed"
                filterTitleID="title"
                filterName="Status"
                filterOptions={statuses}
              ></DataTable>
            </CardContent>
          </Card>
        </div>
    </>
  );
}
