// Tanstack functions
import { ColumnDef, FilterFn, Row } from "@tanstack/react-table";
// Icons
import { CheckCircle2, Clock, AlertCircleIcon } from "lucide-react";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
// Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
// Utilities
import { useNavigate } from "react-router-dom";
import { ActivityType, cn } from "@/lib/utils";
import { useActivities } from "@/context/ActivityContext";
import { useTimeMachineContext } from "@/context/TimeMachine";
import { useMemo } from "react";
import useActivitiesApi from "@/hooks/useActivitiesApi";
import { useAuth } from "@/context/AuthContext";

type ActivityTableProps = {
  isInHome: boolean;
};

export default function ActivityTable({ isInHome }: ActivityTableProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activities } = useActivities();
  const { completeActivity, deleteActivity } = useActivitiesApi();
  const { currentDate } = useTimeMachineContext();

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
        new Date(row.getValue<string>("endDate")) < currentDate;
    }
    if (filter.includes("in progress")) {
      condition ||=
        !row.getValue(columnId) &&
        new Date(row.getValue<string>("endDate")) > currentDate;
    }
    if (filter.includes("done")) {
      condition ||= row.getValue(columnId);
    }
    return condition;
  };

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

  const activityColumns: ColumnDef<ActivityType>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ cell, row }) => {
          const date = new Date(row.getValue<string>("endDate"));
          if (!row.getValue("completed") && date < currentDate)
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
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
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
          if (!row.getValue("completed") && date < currentDate)
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
            return <div className="text-green-700">Completed</div>;
          else if (
            !cell.getValue() &&
            new Date(row.getValue("endDate")) > currentDate
          ) {
            return <div>In progress</div>;
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
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isInHome ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/calendar")}>
                      Open Calendar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigator.clipboard.writeText(data.title)}
                    >
                      Copy Activity Title
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    {" "}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(data);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComplete(data);
                      }}
                    >
                      Mark as Complete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [activities]
  );

  return (
    <DataTable
      data={activities}
      columns={activityColumns}
      filterColumnID="completed"
      filterTitleID="title"
      filterName="Status"
      filterOptions={statuses}
    ></DataTable>
  );
}
